import { InitViewerProps, ViewerHelper } from "@zxtool/cesium-utils"
import { ClassStyle } from "@zxtool/react-utils/dist/type"
import classNames from "classnames"
import React, { useEffect } from "react"

interface EarthProps extends ClassStyle {
  initViewerProps?: InitViewerProps
}

const Earth: React.FC<EarthProps> = ({ initViewerProps = {}, className, style }) => {
  useEffect(() => {
    const viewer = ViewerHelper.init("cesium-container", initViewerProps)
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
