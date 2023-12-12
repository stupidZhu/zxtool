import React, { useEffect } from "react"
import Earth, { EarthProps } from "src/component/Earth"
import MultiViewerService from "./MultiViewerService"

const EarthWithKey: React.FC<EarthProps> = props => {
  return (
    <div className="earth-with-key">
      <span>{(props.initViewerProps?.viewerKey ?? "$$").toString()}</span>
      <Earth {...props} />
    </div>
  )
}

const MultiViewer = () => {
  useEffect(() => {
    MultiViewerService.moduleEnter()
    return () => {
      MultiViewerService.moduleExit()
    }
  }, [])

  return (
    <div className="multi-viewer">
      {/* <div className="earth-mask"></div> */}
      <EarthWithKey initViewerProps={{ hideWidget: true }} />
      <EarthWithKey initViewerProps={{ hideWidget: true, viewerKey: "sub1" }} />
      <EarthWithKey initViewerProps={{ hideWidget: true, viewerKey: "sub2" }} />
      <EarthWithKey initViewerProps={{ hideWidget: true, viewerKey: "sub3" }} />
      <EarthWithKey initViewerProps={{ hideWidget: true, viewerKey: "sub4" }} />
      <EarthWithKey initViewerProps={{ hideWidget: true, viewerKey: "sub5" }} />
    </div>
  )
}

export default MultiViewer
