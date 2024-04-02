export const resizeViewport = (gl: WebGL2RenderingContext, cb?: (width: number, height: number) => void) => {
  const canvas = gl.canvas as HTMLCanvasElement
  const width = canvas.clientWidth
  const height = canvas.clientHeight
  if (canvas.width != width || canvas.height != height) {
    canvas.width = width
    canvas.height = height
    gl.viewport(0, 0, width, height)
    cb?.(width, height)
  }
}
