import { useEffect } from "react"
import Earth from "src/component/Earth"
import CesiumPageService from "./CesiumPageService"

const CesiumPage = () => {
  useEffect(() => {
    CesiumPageService.moduleEnter()
    return () => {
      CesiumPageService.moduleExit()
    }
  }, [])

  return <Earth />
}

export default CesiumPage
