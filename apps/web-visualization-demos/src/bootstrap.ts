import { ZCUConfig } from "@zxtool/cesium-utils"
import * as Cesium from "cesium"

ZCUConfig.setConfig({
  CESIUM_TOKEN:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlNjZmNmYzMi1iMWIwLTRlMmEtYWE1OC1mY2U0ZmVmMDk4ZWQiLCJpZCI6MzQyMzcsImlhdCI6MTY5NzIwMzk0MX0.BwX4c-xXJemVGcPhSD2dnntstoLyED9fUaYnoNHLwWM",
  homeView: {
    destination: new Cesium.Cartesian3(-2849335.743037173, 4760846.116743013, 3145712.136593915),
    orientation: {
      direction: { x: 0.4376860514119243, y: -0.7313128834708686, z: 0.5230797136851726 },
      up: { x: -0.26862496309746325, y: 0.4488351769523517, z: 0.8522837632684538 },
    },
  },
  viewerOptions: { hideWidget: true, fxaa: true },
})
