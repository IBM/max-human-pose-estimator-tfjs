/* global tf, poseEstimator */

import { loadVideo, preferredVideoSize } from './camera-util.js'
import { playNote, getMidiDevices, getAnalyzerValue } from './audio-controller.js'
import { drawBodyParts, drawPoseLines, drawBox, drawWave } from './canvas-overlay.js'
import { guiState, setupGui } from './control-panel.js'

const LEFTWRIST = 'LWrist'
const RIGHTWRIST = 'RWrist'

const ZONEOFFSET = 5
const ZONEHEIGHTFACTOR = 0.7
const ZONEWIDTHFACTOR = 0.5

const VIDEOSIZE = {
  width: 432,
  height: 338
}
const VIDEOZONE = {
  width: VIDEOSIZE.width * ZONEWIDTHFACTOR,
  height: VIDEOSIZE.height * ZONEHEIGHTFACTOR
}

let overlaySize = {
  width: 800,
  height: 600
}

let waveCtx = null
let canvas = null
let canvasCtx = null

const setUserMedia = function () {
  navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia
}

const resetCanvasOverlaySize = function (video, canvas) {
  overlaySize = preferredVideoSize(video)

  if (canvas) {
    canvas.setAttribute('width', overlaySize.width)
    canvas.setAttribute('height', overlaySize.height)
  }
}

const resize = function () {
  const video = document.getElementById('video')
  resetCanvasOverlaySize(video, canvas)
}

/**
 * Feeds an image frame from a video to the model to estimate poses
 * Looping through frames with `tf.nextFrame()`
 */
const detectPoseInRealTime = function (video) {
  let cocoColors = poseEstimator.cocoUtil.colors
  let cocoParts = poseEstimator.cocoUtil.parts

  resetCanvasOverlaySize(video)
  canvas.width = overlaySize.width
  canvas.height = overlaySize.height

  async function poseDetectionFrame () {
    let poses = []
    const prediction = await poseEstimator.predict(video, true)
    if (prediction.posesDetected) {
      poses = prediction.posesDetected
    }

    canvasCtx.clearRect(0, 0, overlaySize.width, overlaySize.height)

    if (guiState.canvas.showVideo) {
      canvasCtx.save()
      canvasCtx.scale(-1, 1)
      canvasCtx.translate(-overlaySize.width, 0)
      canvasCtx.drawImage(video, 0, 0, overlaySize.width, overlaySize.height)
      canvasCtx.restore()
    }

    if (guiState.canvas.showZones) {
      // draw left zone
      drawBox(ZONEOFFSET, ZONEOFFSET, (overlaySize.width * ZONEWIDTHFACTOR), (overlaySize.height * ZONEHEIGHTFACTOR), canvasCtx)
      // draw right zone
      drawBox(ZONEOFFSET, ZONEOFFSET, (overlaySize.width - ZONEOFFSET), (overlaySize.height * ZONEHEIGHTFACTOR), canvasCtx)
    }

    // determine the main figure in frame (i.e., person most centered in the image)
    const noseId = cocoParts.indexOf('Nose')
    const neckId = cocoParts.indexOf('Neck')
    const mainPose = poses.sort((p1, p2) => {
      let a = p1.bodyParts.filter(bp => bp.partId === noseId || bp.partId === neckId)
      let b = p2.bodyParts.filter(bp => bp.partId === noseId || bp.partId === neckId)
      if (a.length && b.length) {
        return Math.abs(VIDEOZONE.width - a[0].x) - Math.abs(VIDEOZONE.width - b[0].x)
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

      drawBodyParts(canvasCtx, mainPose.bodyParts, [LEFTWRIST, RIGHTWRIST], cocoColors, [overlaySize.width / VIDEOSIZE.width, overlaySize.height / VIDEOSIZE.height])
      drawPoseLines(canvasCtx, mainPose.poseLines, cocoColors, [overlaySize.width / VIDEOSIZE.width, overlaySize.height / VIDEOSIZE.height])
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
  const verticalSplit = VIDEOZONE.width
  const rightEdge = overlaySize.width - ZONEOFFSET
  const topEdge = ZONEOFFSET
  const bottomEdge = VIDEOZONE.height

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
  // https://github.com/CODAIT/max-tfjs-models/tree/master/human-pose-estimator
  await poseEstimator.loadModel(true)

  const body = document.getElementsByTagName('body')[0]

  let video

  try {
    video = await loadVideo('video', VIDEOSIZE)
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
