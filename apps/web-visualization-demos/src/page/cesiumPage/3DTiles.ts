import { TilesetHelper, ViewerHelper } from "@zxtool/cesium-utils"
import * as Cesium from "cesium"

export const 加载3DTiles = () => {
  const viewer = ViewerHelper.getViewer()!

  TilesetHelper.add({
    key: "test",
    url: "/model/3dtiles/tileset.json",
    type: "bimModel",
    flyTo: true,
  }).then(({ tileset }) => {
    tileset.style = new Cesium.Cesium3DTileStyle({
      color: {
        conditions: [
          ["${feature['Height']} > 50", "color('pink')"],
          ["${feature['Height']} > 10", "color('gold')"],
          ["true", "color('teal')"],
        ],
      },
    })
  })

  viewer.extend(Cesium.viewerCesium3DTilesInspectorMixin)
}
