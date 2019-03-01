
const isSafari = function () {
  const hasSafari = /Safari/i.test(navigator.userAgent)
  const hasChrome = /Chrome/i.test(navigator.userAgent)

  return hasSafari && !hasChrome
}

/**
 * Load the video camera
 *
 * @param {Node | String} domNode - DOM Node or id of the DOM Node to load video into (default: 'video')
 */
export async function loadVideo (domNode) {
  const video = await setupCamera(domNode)
  video.play()
  return video
}

/**
 * Set up the navigator media device
 *
 * @param {Node | String} domNode - DOM Node or id of the DOM Node to load video into (default: 'video')
 */
async function setupCamera (domNode = 'video') {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Browser API navigator.mediaDevices.getUserMedia not available')
  }

  const video = typeof domNode === 'string' ? document.getElementById(domNode) : domNode

  const size = preferredVideoSize(null)
  video.width = size.width
  video.height = size.height
  let constraint = {
    'audio': false,
    'video': {
      facingMode: 'user'
    }
  }

  if (!isSafari()) {
    constraint.video.width = size.width
    constraint.video.height = size.height
  }

  video.srcObject = await navigator.mediaDevices.getUserMedia(constraint)

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video)
    }
  })
}

export const preferredVideoSize = function (video) {
  let size = {
    width: 432, // window.innerWidth,
    height: 338 // window.innerHeight
  }

  return size
}
