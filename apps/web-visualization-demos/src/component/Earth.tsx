import { InitViewerProps, ViewerHelper } from "@zxtool/cesium-utils"
import { ClassStyle } from "@zxtool/react-utils/dist/type"
import classNames from "classnames"
import React, { useEffect, useRef } from "react"

export interface EarthProps extends ClassStyle {
  initViewerProps?: InitViewerProps
}

const Earth: React.FC<EarthProps> = ({ initViewerProps = {}, className, style }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) ViewerHelper.init(ref.current, initViewerProps)
    return () => {
      ViewerHelper.destroy(initViewerProps.viewerKey)
    }
  }, [])

  return <div ref={ref} className={classNames("rcc-cesium-container", className)} style={style} />
}

export default Earth
