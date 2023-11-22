import { useEffect } from "react"
import ThreeCanvas from "src/component/ThreeCanvas"
import ThreePageService from "./ThreePageService"

const ThreePage = () => {
  useEffect(() => {
    ThreePageService.moduleEnter()
    return () => {
      ThreePageService.moduleExit()
    }
  }, [])

  return <ThreeCanvas />
}

export default ThreePage
