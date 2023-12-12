import { ClassStyle } from "@zxtool/react-utils"
import { ClickPlugin, OrbitControlsPlugin } from "@zxtool/three-utils"
import React, { useEffect, useRef } from "react"
import { threeHelper } from "src/bootstrap"

const ThreeCanvas: React.FC<ClassStyle> = props => {
  const { className, style } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    threeHelper.init(canvasRef.current)
    threeHelper.add(new OrbitControlsPlugin())
    threeHelper.add(new ClickPlugin(canvasRef.current))
    return () => {}
  }, [])

  return <canvas id="three-canvas" className={className} style={style} ref={canvasRef}></canvas>
}

export default ThreeCanvas
