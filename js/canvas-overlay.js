
const red10 = '#FFF0F1'
const boundingBoxColor = 'red'
const lineWidth = 2
const pointRadius = 4

/**
 * draw point on given canvas
 *
 * @param {CanvasRenderingContext2D} canvasCtx - the canvas rendering context to draw point
 * @param {Integer} x - the horizontal value of point
 * @param {Integer} y - the vertical value of point
 * @param {String} c - the color value for point
 */
function drawPoint (canvasCtx, x, y, c = 'black') {
  canvasCtx.beginPath()
  canvasCtx.arc(x, y, pointRadius, 0, 2 * Math.PI)
  canvasCtx.fillStyle = c
  canvasCtx.fill()
}

/**
 * Draws a line on a canvas
 *
 * @param {CanvasRenderingContext2D} canvasCtx - the canvas rendering context to draw point
 * @param {Integer} x1 - the horizontal value of first point
 * @param {Integer} y1 - the vertical value of first point
 * @param {Integer} x2 - the horizontal value of first point
 * @param {Integer} y2 - the vertical value of first point
 * @param {String} c - the color value for line
 */
function drawLine (canvasCtx, x1, y1, x2, y2, c = 'black') {
  canvasCtx.beginPath()
  canvasCtx.moveTo(x1, y1)
  canvasCtx.lineTo(x2, y2)
  canvasCtx.lineWidth = lineWidth
  canvasCtx.strokeStyle = c
  canvasCtx.stroke()
}

/**
 * Draws the pose lines (i.e., skeleton)
 *
 * @param {CanvasRenderingContext2D} ctx - the canvas rendering context to draw pose lines
 * @param {Array} poseLines - array of coordinates corresponding to the pose lines
 * @param {Array} colors - array of RGB values of colors to use for drawing pose lines
 */
export function drawPoseLines (ctx, poseLines, colors) {
  poseLines.forEach((l, j) => {
    let color = `rgb(${colors[j].join()})`
    drawLine(ctx, ...l, color)
  })
}

/**
 * Draws the left and right wrists keypoints
 *
 * @param {CanvasRenderingContext2D} ctx - the canvas rendering context to draw pose lines
 * @param {Array} bodyParts - array of objects containing body part info
 * @param {Array} partsToDraw - array of the body parts to daw
 * @param {Array} colors - array of RGB values of colors to use for drawing pose lines
 */
export function drawBodyParts (ctx, bodyParts, partsToDraw, colors) {
  bodyParts.forEach(p => {
    if (!partsToDraw || partsToDraw.includes(p.partName)) {
      let color = `rgb(${colors[p.partId]})`
      drawPoint(ctx, p.x, p.y, color)
    }
  })
}

/**
 * Draws a box on a canvas
 *
 * @param {CanvasRenderingContext2D} ctx - the canvas rendering context to draw the box
 * @param {Integer} x1 - the horizontal value of first point
 * @param {Integer} y1 - the vertical value of first point
 * @param {Integer} x2 - the horizontal value of first point
 * @param {Integer} y2 - the vertical value of first point
 */
export function drawBox (x1, y1, x2, y2, ctx) {
  ctx.rect(x1, y1, x2 - x1, y2 - y1)
  ctx.strokeStyle = boundingBoxColor
  ctx.stroke()
}

/**
 * Draws a box on a canvas
 *
 * @param {CanvasRenderingContext2D} ctx - the canvas rendering context to draw the waveform
 * @param {Array} points - array of points of the waveform
 */
export function drawWave (points, ctx) {
  const scale = function (val, low, high, min, max) {
    return (val - low) / (high - low) * (max - min) + min
  }

  const w = ctx.canvas.width
  const h = ctx.canvas.height
  const m = 0.05 * h
  const pts = typeof points === 'object' && points.length ? points : [0, 0]
  const len = pts.length

  ctx.clearRect(0, 0, w, h)
  ctx.beginPath()
  ctx.moveTo(w, h)
  ctx.lineTo(0, h)

  for (var p = 0; p < len; p++) {
    const x = scale(p, 0, len - 1, 0, w)
    const y = scale(pts[p], -1, 1, h - m, m)

    ctx.lineTo(x, y)
  }

  ctx.lineTo(w, h)
  ctx.lineCap = 'round'
  ctx.fillStyle = red10
  ctx.fill()
}
