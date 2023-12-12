import { TilesetManager, ZCUConfig } from "@zxtool/cesium-utils"
import { ThreeHelper } from "@zxtool/three-utils"
import * as Cesium from "cesium"

const myToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzZTAxYTZlOC0yOThlLTQ2OTgtYWFkZC04MDE0ZTQ2YzViYTQiLCJpZCI6NjY5ODcsImlhdCI6MTYzMTQ1MjA1NH0.IuDCpDiMstjhEw2AQ9N9ZQAHCc46n714_AF4kmKn4rw"

ZCUConfig.setConfig({
  CESIUM_TOKEN: myToken,
  homeView: {
    destination: new Cesium.Cartesian3(-2849335.743037173, 4760846.116743013, 3145712.136593915),
    orientation: {
      direction: { x: 0.4376860514119243, y: -0.7313128834708686, z: 0.5230797136851726 },
      up: { x: -0.26862496309746325, y: 0.4488351769523517, z: 0.8522837632684538 },
    },
  },
  viewerOptions: { hideWidget: true, fxaa: true },
})

export const threeHelper = new ThreeHelper()

export const tilesetManager = new TilesetManager()
