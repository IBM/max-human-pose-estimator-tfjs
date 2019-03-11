/* global tf */

import { cocoColors, cocoParts } from './coco-common.js'
import { estimatePoses } from './pose-estimator.js'
import { loadVideo, preferredVideoSize } from './camera-util.js'
import { playNote, getMidiDevices, getAnalyzerValue } from './audio-controller.js'
import { drawBodyParts, drawPoseLines, drawBox, drawWave } from './canvas-overlay.js'
import { guiState, setupGui } from './control-panel.js'

const MODELURL = '/model/model.json'

const LEFTWRIST = 'LWrist'
const RIGHTWRIST = 'RWrist'

const TARGETSIZE = {
  width: 432,
  height: 338
}
const ZONEOFFSET = 10
const ZONEFACTOR = 0.7

let overlayWidth = 800
let overlayHeight = 600
let zoneWidth = overlayWidth * 0.5
let zoneHeight = overlayHeight * ZONEFACTOR

let openposeModel = null
let waveCtx = null
let canvas = null
let canvasCtx = null

const setUserMedia = function () {
  navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia
}

const resetVideoCanvasSize = function (video, canvas) {
  const size = preferredVideoSize(video)

  overlayWidth = size.width
  overlayHeight = size.height
  zoneWidth = overlayWidth * 0.5
  zoneHeight = overlayHeight * ZONEFACTOR

  if (canvas) {
    canvas.setAttribute('width', overlayWidth)
    canvas.setAttribute('height', overlayHeight)
    // video.setAttribute('width', overlayWidth)
    // video.setAttribute('height', overlayHeight)
  }
}

const resize = function () {
  const video = document.getElementById('video')
  resetVideoCanvasSize(video, canvas)
}

/**
 * convert image/video to Tensor input required by the model
 *
 * @param {HTMLImageElement|HTMLVideoElement} imageOrVideoInput - the image or video element
 */
function preprocessInput (imageOrVideoInput) {
  return tf.tidy(() => {
    // create tensor from input element
    return tf.browser
      .fromPixels(imageOrVideoInput)
      .reverse(1) // reverse since images are being fed from a webcam
      .toFloat()
      .expandDims()
  })
}

/**
 * Feeds an image frame from a video to the model to estimate poses
 * Looping through frames with `tf.nextFrame()`
 */
const detectPoseInRealTime = function (video) {
  resetVideoCanvasSize(video)
  canvas.width = overlayWidth
  canvas.height = overlayHeight

  async function poseDetectionFrame () {
    let inputTensor = preprocessInput(video)

    let outputTensor = openposeModel.predict(inputTensor)

    let poses = estimatePoses(outputTensor)

    canvasCtx.clearRect(0, 0, overlayWidth, overlayHeight)

    if (guiState.canvas.showVideo) {
      canvasCtx.save()
      canvasCtx.scale(-1, 1)
      canvasCtx.translate(-overlayWidth, 0)
      canvasCtx.drawImage(video, 0, 0, overlayWidth, overlayHeight)
      canvasCtx.restore()
    }

    if (guiState.canvas.showZones) {
      // draw left zone
      drawBox(ZONEOFFSET, ZONEOFFSET, zoneWidth, zoneHeight, canvasCtx)
      // draw right zone
      drawBox(zoneWidth, ZONEOFFSET, overlayWidth - ZONEOFFSET, zoneHeight, canvasCtx)
    }

    // determine the main figure in frame (i.e., person most centered in the image)
    const noseId = cocoParts.indexOf('Nose')
    const neckId = cocoParts.indexOf('Neck')
    const mainPose = poses.sort((p1, p2) => {
      let a = p1.bodyParts.filter(bp => bp.partId === noseId || bp.partId === neckId)
      let b = p2.bodyParts.filter(bp => bp.partId === noseId || bp.partId === neckId)
      if (a.length && b.length) {
        return Math.abs(zoneWidth - a[0].x) - Math.abs(zoneWidth - b[0].x)
      } else {
        return a.length - b.length
      }
    })[0]

    // draw the skeleton for the pose detected and trigger note playing
    if (mainPose) {
      const leftWrist = mainPose.bodyParts.filter(bp => bp.partName === LEFTWRIST)[0]
      const rightWrist = mainPose.bodyParts.filter(bp => bp.partName === RIGHTWRIST)[0]

      if (leftWrist && rightWrist) {
        // Normalize keypoints to values between 0 and 1 (horizontally & vertically)
        const position = normalizePositions(leftWrist, rightWrist)

        if (position.right.vertical > 0 && position.left.horizontal > 0) {
          playNote(
            position.right.vertical, // note
            position.left.horizontal, // volume
            guiState.noteDuration,
            guiState.chordIntervals === 'default' ? null : guiState.chordIntervals
          )
        } else {
          playNote(0, 0)
        }
      } else {
        playNote(0, 0)
      }

      drawBodyParts(canvasCtx, mainPose.bodyParts, [LEFTWRIST, RIGHTWRIST], cocoColors)
      drawPoseLines(canvasCtx, mainPose.poseLines, cocoColors)
    }

    if (guiState.canvas.showWaveform) {
      const value = getAnalyzerValue()
      drawWave(value, waveCtx)
    }

    await tf.nextFrame()
    poseDetectionFrame()
  }

  poseDetectionFrame()
}

/**
 * Returns an object the horizontal and vertical positions of left and right wrist normalized between 0 and 1
 *
 * @param {Object} leftWrist - 'leftWrist' keypoints (corresponds to user's right hand)
 * @param {Object} rightWrist - 'rightWrist' keypoints (corresponds to user's left hand)
 */
const normalizePositions = function (leftWrist, rightWrist) {
  const leftZone = rightWrist
  const rightZone = leftWrist

  const leftEdge = ZONEOFFSET
  const verticalSplit = zoneWidth
  const rightEdge = overlayWidth - ZONEOFFSET
  const topEdge = ZONEOFFSET
  const bottomEdge = zoneHeight

  let position = {
    right: {
      vertical: 0,
      horizontal: 0
    },
    left: {
      vertical: 0,
      horizontal: 0
    }
  }

  if (rightZone.x >= verticalSplit && rightZone.x <= rightEdge) {
    position.right.horizontal = computePercentage(rightZone.x, verticalSplit, rightEdge)
  }
  if (rightZone.y <= bottomEdge && rightZone.y >= topEdge) {
    position.right.vertical = computePercentage(rightZone.y, bottomEdge, topEdge)
  }
  if (leftZone.x >= leftEdge && leftZone.x <= verticalSplit) {
    position.left.horizontal = computePercentage(leftZone.x, verticalSplit, leftEdge)
  }
  if (leftZone.y <= bottomEdge && leftZone.y >= topEdge) {
    position.left.vertical = computePercentage(leftZone.y, bottomEdge, topEdge)
  }

  return position
}

/**
 * Compute percentage of the provided value in the given range
 *
 * @param {Number} value - a number between 'low' and 'high' to compute percentage
 * @param {Number} low - corresponds to a number that should produce value 0
 * @param {Number} high - corresponds to a number that should produce value 1
 */
const computePercentage = function (value, low, high) {
  const dist = isNaN(value) ? 0 : value
  const minDist = isNaN(low) ? 0 : low
  const maxDist = isNaN(high) ? dist + 1 : high

  return (dist - minDist) / (maxDist - minDist)
}

/**
 * Kicks off the demo by loading the model, finding and loading
 * available camera devices, and setting off the detectPoseInRealTime function.
 */
const bindPage = async function () {
  // https://js.tensorflow.org/api/1.0.0/#loadGraphModel
  openposeModel = await tf.loadGraphModel(MODELURL)

  const body = document.getElementsByTagName('body')[0]

  let video

  try {
    video = await loadVideo('video', TARGETSIZE)
    await setupGui([])
    body.className = 'ready'
    detectPoseInRealTime(video)
  } catch (e) {
    body.className = 'error'
    const info = document.getElementById('info')
    info.textContent = 'Browser does not support video capture or this device does not have a camera'
    throw e
  }

  window.onresize = resize
}

// init the app
const init = function () {
  canvas = document.getElementById('output')
  canvasCtx = canvas.getContext('2d')
  waveCtx = document.getElementById('wave').getContext('2d')

  drawWave([], waveCtx)
  setUserMedia()
  getMidiDevices().then(bindPage)
}

// run the app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  setTimeout(init, 500)
}
