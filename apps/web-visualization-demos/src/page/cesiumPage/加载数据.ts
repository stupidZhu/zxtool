import { EntityUtil, ViewerHelper } from "@zxtool/cesium-utils"
import * as Cesium from "cesium"

export const 加载geojson = () => {
  const viewer = ViewerHelper.getViewer()!
  new Cesium.GeoJsonDataSource("china").load("/data/china.json").then(dataSource => {
    viewer.dataSources.add(dataSource)
    viewer.flyTo(dataSource)
    dataSource.entities.values.forEach(entity => {
      console.log(EntityUtil.getProperties(entity))
      const height = Math.random() * 100000 + 50000
      entity.polygon!.extrudedHeight = new Cesium.ConstantProperty(height)
      entity.polygon!.outline = new Cesium.ConstantProperty(false)
      entity.polygon!.material = new Cesium.ColorMaterialProperty(Cesium.Color.fromRandom({ alpha: 1 }))
    })
  })
}
