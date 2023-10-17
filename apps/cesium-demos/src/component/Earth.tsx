import { ViewerHelper } from "@zxtool/cesium-utils"
import { ClassStyle } from "@zxtool/react-utils/dist/type"
import classNames from "classnames"
import React, { useEffect } from "react"

const Earth: React.FC<ClassStyle> = ({ className, style }) => {
  useEffect(() => {
    ViewerHelper.init("cesium-container")
    return () => {
      ViewerHelper.destroy()
    }
  }, [])

  return <div id="cesium-container" className={classNames("rcc-cesium-container", className)} style={style} />
}

export default Earth
