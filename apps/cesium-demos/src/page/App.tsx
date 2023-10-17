import { TrailLine2MaterialProperty, ViewerHelper } from "@zxtool/cesium-utils"
import * as Cesium from "cesium"
import { useEffect } from "react"
import Earth from "src/component/Earth"

function addTrailPolyline() {
  const viewer = ViewerHelper.getViewer()!

  const entity = viewer.entities.add({
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArrayHeights([0, 0, 5000, 0, 5, 5000, 5, 5, 5000, 5, 0, 5000]),
      width: 1,
      material: new TrailLine2MaterialProperty({
        color: Cesium.Color.YELLOW,
        bgColor: Cesium.Color.RED.withAlpha(0.2),
        speed: 2,
        percent: 0.1,
        count: 5,
      }),
    },
  })

  viewer.flyTo(entity)
}

const App = () => {
  useEffect(() => {
    setTimeout(() => {
      addTrailPolyline()
    }, 2000)
  }, [])

  return <Earth />
}

export default App
