import { useEffect } from "react"
import Earth from "src/component/Earth"
import ThreeCanvas from "src/component/ThreeCanvas"
import CesiumThreeService from "./CesiumThreeService"

const CesiumThree = () => {
  useEffect(() => {
    CesiumThreeService.moduleEnter()
    return () => {
      CesiumThreeService.moduleExit()
    }
  }, [])

  return (
    <div className="cesium-three">
      <Earth />
      <ThreeCanvas className="ct-three" />
    </div>
  )
}

export default CesiumThree
