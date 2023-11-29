import { useEffect } from "react"
import { DevPanel, ToolWrapper } from "react-components"
import Earth from "src/component/Earth"
import CesiumPageService from "./CesiumPageService"
import { test } from "./LargePointHelper"

const CesiumPage = () => {
  useEffect(() => {
    CesiumPageService.moduleEnter()

    return () => {
      CesiumPageService.moduleExit()
    }
  }, [])

  return (
    <>
      <DevPanel>
        <ToolWrapper name="hello">
          <button onClick={test}>test</button>
        </ToolWrapper>
      </DevPanel>
      <Earth />
    </>
  )
}

export default CesiumPage
