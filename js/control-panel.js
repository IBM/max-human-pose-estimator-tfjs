/* global dat */

import { getMidiDevices, setPreferredDevice, getBrowserPresets, setPreferredPreset } from './audio-controller.js'
import { chords } from './chord-intervals.js'

const DEFAULTCHORDS = 'minor0'

/**
 *  Defines control panel settings and default values
 * */
export let guiState = {
  outputDevice: 'browser',
  chordIntervals: 'default',
  noteDuration: 300,
  browser: {
    preset: 'default'
  },
  postProcess: {
    nmsWindowSize: 6,
    nmsThreshold: 0.001,
    localPAFThreshold: 0.141,
    partScoreThreshold: 0.247,
    pafCountThreshold: 4,
    partCountThreshold: 4
  },
  canvas: {
    showVideo: true,
    showSkeleton: true,
    showPoints: true,
    showZones: true,
    showWaveform: true
  }
}

/**
 * Sets up control panel on the top-right of the window
 */
export async function setupGui (cameras, domNode = 'control-panel') {
  if (cameras.length > 0) {
    guiState.camera = cameras[0].deviceId
  }

  const gui = new dat.GUI({ width: 300, autoPlace: false })
  const controlPanel = typeof domNode === 'string' ? document.getElementById(domNode) : domNode
  controlPanel.appendChild(gui.domElement)

  // Get available MIDI output devices
  const midiDevices = await getMidiDevices()
  const mouts = Object.keys(midiDevices)
  if (mouts.length > 0) {
    guiState.outputDevice = mouts[0]
    setPreferredDevice(mouts[0])
  }

  // Selector for MIDI device (with additional option for Browser Audio API)
  const outputDeviceController = gui.add(guiState, 'outputDevice', ['browser'].concat(mouts))

  // Get available chords
  const achords = Object.keys(chords)
  if (achords.length > 0) {
    let defaultIndex = achords.indexOf(DEFAULTCHORDS)
    guiState.chordIntervals = defaultIndex >= 0 ? achords[defaultIndex] : achords[0]
  }

  // Selector for values to use for the MIDI notes
  gui.add(guiState, 'chordIntervals', ['default'].concat(achords))

  // Selector for the duration (in milliseconds) for how long a note is ON
  gui.add(guiState, 'noteDuration', 100, 2000, 50)

  const browserPreset = gui.addFolder('Browser')

  // Get available browser presets
  const binst = getBrowserPresets()
  if (binst.length > 0) {
    guiState.browser.preset = binst[0]
    setPreferredPreset(binst[0])
  }

  // Selector for Tone.js presets to use in the browser
  const browserPresetController = browserPreset.add(guiState.browser, 'preset', ['default'].concat(binst))

  // Parameters to tweak the post processing of the prediction
  let postProcess = gui.addFolder('PostProcess')
  postProcess.add(guiState.postProcess, 'nmsWindowSize', 1, 20, 1)
  postProcess.add(guiState.postProcess, 'nmsThreshold', 0.001, 1, 0.005)
  postProcess.add(guiState.postProcess, 'localPAFThreshold', 0.001, 1, 0.005)
  postProcess.add(guiState.postProcess, 'partScoreThreshold', 0.001, 1, 0.005)
  postProcess.add(guiState.postProcess, 'pafCountThreshold', 1, 15, 1)
  postProcess.add(guiState.postProcess, 'partCountThreshold', 1, 10, 1)

  // Canvas overlay options
  let canvas = gui.addFolder('Canvas')
  canvas.add(guiState.canvas, 'showVideo')
  canvas.add(guiState.canvas, 'showSkeleton')
  canvas.add(guiState.canvas, 'showPoints')
  canvas.add(guiState.canvas, 'showZones')
  canvas.add(guiState.canvas, 'showWaveform')

  outputDeviceController.onChange(function (value) {
    if (!guiState.outputDevice || guiState.outputDevice === 'browser') {
      browserPreset.open()
    } else {
      browserPreset.close()
    }

    setPreferredDevice(guiState.outputDevice)
  })

  browserPresetController.onChange(function (value) {
    setPreferredPreset(guiState.browser.preset)
  })
}
