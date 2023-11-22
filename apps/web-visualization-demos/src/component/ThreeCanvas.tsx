import { ClickPlugin, OrbitControlsPlugin } from "@zxtool/three-utils"
import { useEffect, useRef } from "react"
import { threeHelper } from "src/bootstrap"

const ThreeCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    threeHelper.init(canvasRef.current)
    threeHelper.add(new OrbitControlsPlugin())
    threeHelper.add(new ClickPlugin(canvasRef.current))
    return () => {}
  }, [])

  return <canvas id="three-canvas" ref={canvasRef}></canvas>
}

export default ThreeCanvas
