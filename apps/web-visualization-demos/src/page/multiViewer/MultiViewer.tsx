import { useEffect } from "react"
import Earth from "src/component/Earth"
import MultiViewerService from "./MultiViewerService"

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
      <Earth initViewerProps={{ hideWidget: true }} />
      <Earth initViewerProps={{ hideWidget: true, viewerKey: "sub" }} />
    </div>
  )
}

export default MultiViewer
