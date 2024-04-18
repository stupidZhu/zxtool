import { MathUtils } from "@zxtool/three-math"

export interface ResizeViewportProps {
  gl: WebGL2RenderingContext
  cb?: (width: number, height: number) => void
  quality?: number
}
export const resizeViewport = (props: ResizeViewportProps) => {
  const { gl, cb, quality = 1 } = props
  const q = MathUtils.clamp(quality, 0.1, 2)
  const canvas = gl.canvas as HTMLCanvasElement
  const width = Math.floor(canvas.clientWidth * devicePixelRatio * q)
  const height = Math.floor(canvas.clientHeight * devicePixelRatio * q)
  if (canvas.width != width || canvas.height != height) {
    canvas.width = width
    canvas.height = height
    gl.viewport(0, 0, width, height)
    cb?.(width, height)
  }
}
