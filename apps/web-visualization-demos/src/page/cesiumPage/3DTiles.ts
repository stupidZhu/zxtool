import { TilesetManager, ViewerHelper } from "@zxtool/cesium-utils"
import * as Cesium from "cesium"
import GUI from "lil-gui"

export const 加载3DTiles = () => {
  const viewer = ViewerHelper.getViewer()!

  viewer.scene.globe.enableLighting = true

  const center = [-1.31968, 0.698874]

  TilesetManager.add({
    key: "columns",
    url: "/model/3dtiles/columns/tileset.json",
    flyTo: false,
  }).then(({ tileset }) => {
    tileset.style = new Cesium.Cesium3DTileStyle({
      defines: {
        dis: "distance(vec2(-1.31968, 0.698874),vec2(${feature['Longitude']},${feature['Latitude']}))",
      },
      color: {
        conditions: [
          // ["${feature['Height']} > 50", "color('pink')"],
          // ["${feature['Height']} > 10", "color('gold')"],
          ["${dis} < 0.00001", "color('pink')"],
          ["${dis} < 0.00002", "color('gold')"],
          ["true", "color('teal')"],
        ],
      },
    })
  })

  TilesetManager.add({
    key: "building",
    url: "/model/3dtiles/building/tileset.json",
    flyTo: true,
  }).then(({ tileset }) => {
    tileset.customShader = new Cesium.CustomShader({
      fragmentShaderText: `
      void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material){
        float t = fract(fsInput.attributes.positionMC.z / 20.0);
        t = clamp(t, 0.0, 1.0);
        material.diffuse = vec3(0.0, t, 1.0);
        // material.alpha = alpha;
      }
      `,
      translucencyMode: Cesium.CustomShaderTranslucencyMode.TRANSLUCENT,
    })
  })

  viewer.extend(Cesium.viewerCesium3DTilesInspectorMixin)
}

export const 偏移矩阵 = async () => {
  const viewer = ViewerHelper.getViewer()!
  viewer.scene.globe.depthTestAgainstTerrain = true

  const { tileset } = await TilesetManager.add({
    key: "columns",
    url: "/model/3dtiles/columns/tileset.json",
    flyTo: true,
  })

  const matrix = Cesium.Matrix4.fromScale(new Cesium.Cartesian3(1.0, 2.0, 3.0))
  tileset.modelMatrix = matrix

  const gui = new GUI()
  gui.add(tileset.modelMatrix, "0", -5, 5, 0.01)
  gui.add(tileset.modelMatrix, "1", -5, 5, 0.01)
  gui.add(tileset.modelMatrix, "2", -5, 5, 0.01)

  gui.add(tileset.modelMatrix, "4", -5, 5, 0.01)
  gui.add(tileset.modelMatrix, "5", -5, 5, 0.01)
  gui.add(tileset.modelMatrix, "6", -5, 5, 0.01)

  gui.add(tileset.modelMatrix, "8", -5, 5, 0.01)
  gui.add(tileset.modelMatrix, "9", -5, 5, 0.01)
  gui.add(tileset.modelMatrix, "10", -5, 5, 0.01)

  gui.add(tileset.modelMatrix, "12", -500, 500, 1).name("x")
  gui.add(tileset.modelMatrix, "13", -500, 500, 1).name("y")
  gui.add(tileset.modelMatrix, "14", -500, 500, 1).name("z")

  // gui.add(tileset.modelMatrix, "12", -500, 500, 1).name("x")
  // gui.add(tileset.modelMatrix, "13", -500, 500, 1).name("y")
  // gui.add(tileset.modelMatrix, "14", -500, 500, 1).name("z")

  console.log(
    Cesium.Matrix4.fromTranslationQuaternionRotationScale(
      new Cesium.Cartesian3(10, 20, 30),
      new Cesium.Quaternion(Math.PI, Math.PI / 2.0, Math.PI / 4),
      new Cesium.Cartesian3(2, 3, 4),
    ),
  )
}

export const 点云 = async () => {
  const viewer = ViewerHelper.getViewer()!

  // const { tileset } = await TilesetManager.add({
  //   url: "https://assets.ion.cesium.com/ap-northeast-1/asset_depot/28945/MontrealPointCloud/v1/tileset.json?v=2",
  //   key: 28945,
  // })

  console.log(Cesium.IonResource.fromAssetId(10890))

  // viewer.flyTo(tileset)
}
