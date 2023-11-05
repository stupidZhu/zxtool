import { ViewerHelper } from "@zxtool/cesium-utils"
import { ClassStyle } from "@zxtool/react-utils/dist/type"
import classNames from "classnames"
import React, { useEffect } from "react"

const Earth: React.FC<ClassStyle> = ({ className, style }) => {
  useEffect(() => {
    const viewer = ViewerHelper.init("cesium-container", { hideWidget: true })
    // viewer.scene.terrainProvider = Cesium.createWorldTerrain({ requestVertexNormals: true, requestWaterMask: true })

    return ViewerHelper.destroy
  }, [])

  return (
    <div
      id="cesium-container"
      className={classNames("rcc-cesium-container", className)}
      style={{ height: "100%", ...style }}
    />
  )
}

export default Earth
