import { useEffect } from "react"
import { DevPanel, ToolWrapper } from "react-components"
import Earth from "src/component/Earth"
import CesiumPageService from "./CesiumPageService"
import { 添加分层, 移除Grid } from "./分层"

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
          <div style={{ display: "flex", flexWrap: "wrap", gap: 15 }}>
            <button onClick={添加分层}>添加分层</button>
            <button onClick={移除Grid}>移除Grid</button>
          </div>
        </ToolWrapper>
      </DevPanel>
      <div className="earth-mask"></div>
      <Earth />
    </>
  )
}

export default CesiumPage
