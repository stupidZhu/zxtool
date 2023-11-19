import { ScreenEventHelper, ViewerHelper } from "@zxtool/cesium-utils"
import * as Cesium from "cesium"

export const primitive基础 = () => {
  const viewer = ViewerHelper.getViewer()!

  const boxGeom = new Cesium.BoxGeometry({
    // vertexFormat: Cesium.VertexFormat.POSITION_ONLY,
    vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
    maximum: new Cesium.Cartesian3(250000, 250000, 250000),
    minimum: new Cesium.Cartesian3(-250000, -250000, -250000),
  })

  const boxInstance = new Cesium.GeometryInstance({
    geometry: boxGeom,
    modelMatrix: Cesium.Matrix4.multiplyByTranslation(
      Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(0, 0)),
      new Cesium.Cartesian3(0.0, 0.0, 250000),
      new Cesium.Matrix4(),
    ),
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.RED),
    },
  })

  const primitive = new Cesium.Primitive({
    geometryInstances: boxInstance,
    appearance: new Cesium.PerInstanceColorAppearance({
      closed: true,
    }),
  })
  viewer.scene.primitives.add(primitive)

  // ----------------------- RECT
  const rectGeomInstance = new Cesium.GeometryInstance({
    id: "rectGeomInstance",
    geometry: new Cesium.RectangleGeometry({
      rectangle: Cesium.Rectangle.fromDegrees(0, 0, 10, 10),
    }),
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.TEAL),
    },
  })
  const rectPrimitive = new Cesium.Primitive({
    geometryInstances: rectGeomInstance,
    appearance: new Cesium.MaterialAppearance({
      material: Cesium.Material.fromType("Color", { color: Cesium.Color.TEAL }),
    }),
  })
  viewer.scene.primitives.add(rectPrimitive)

  const rectGeomInstance1 = new Cesium.GeometryInstance({
    id: "rectGeomInstance1",
    geometry: new Cesium.RectangleGeometry({
      rectangle: Cesium.Rectangle.fromDegrees(10, 10, 20, 20),
    }),
  })
  const rectPrimitive1 = new Cesium.Primitive({
    geometryInstances: rectGeomInstance1,
    appearance: new Cesium.EllipsoidSurfaceAppearance({
      material: Cesium.Material.fromType("Color", {
        color: Cesium.Color.TEAL,
      }),
    }),
  })
  viewer.scene.primitives.add(rectPrimitive1)

  // setInterval(() => {
  //   rectPrimitive.getGeometryInstanceAttributes("rectGeomInstance").color = Cesium.ColorGeometryInstanceAttribute.toValue(
  //     Cesium.Color.fromRandom(),
  //   )
  // }, 2000)

  // ----------------------- Entity

  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(20, 20),
    point: {
      pixelSize: 10,
      color: Cesium.Color.fromCssColorString("pink"),
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
    },
  })

  // ----------------------- Event

  ScreenEventHelper.addEvent({
    key: "test",
    type: "LEFT_CLICK",
    cb(movement) {
      const pickedObject = viewer.scene.pick(movement.position)
      console.log(pickedObject)
    },
  })
}

export const fabric基础 = () => {
  const viewer = ViewerHelper.getViewer()!

  const primitive = new Cesium.Primitive({
    geometryInstances: new Cesium.GeometryInstance({
      geometry: new Cesium.RectangleGeometry({
        rectangle: Cesium.Rectangle.fromDegrees(0, 0, 20, 20),
      }),
    }),
    appearance: new Cesium.EllipsoidSurfaceAppearance({
      material: new Cesium.Material({
        fabric: {
          source: `
          #define PI 3.14159265358979

          czm_material czm_getMaterial(czm_materialInput materialInput) {
            czm_material material = czm_getDefaultMaterial(materialInput);
            vec2 st = materialInput.st;
            st -= 0.5;

            float angle = atan(st.y,st.x) - czm_frameNumber / 100.0;
            angle = (angle + PI) / (PI * 2.0);
            angle = fract(angle * 10.0 );
            float dis = distance(st, vec2(0.0));
            
            material.alpha = dis > 0.5 ? 0.0 : angle;
            material.diffuse = vec3(0.0, 1.0, 1.0);
            return material;
          }
          `,
        },
        translucent: true,
      }),
    }),
  })

  viewer.scene.primitives.add(primitive)
}

export const shader基础 = () => {
  const viewer = ViewerHelper.getViewer()!

  const appearance = new Cesium.MaterialAppearance({
    fragmentShaderSource: `
    #define PI 3.14159265358979

    uniform vec3 u_color;

    varying vec2 v_st;

    void main(){
      vec2 st = v_st - 0.5;

      float angle = atan(st.y, st.x);
      angle = (angle + PI) / (PI * 2.0) - czm_frameNumber / 500.0;
      angle = fract(angle * 10.0);
      float dis = distance(st,vec2(0.0));
      float alpha = dis > 0.5 ? 0.0 : angle;

      gl_FragColor = vec4(u_color, alpha);
    }
    `,
    translucent: true,
  })
  // @ts-ignore
  appearance.uniforms = {
    u_color: Cesium.Color.TEAL,
  }

  const primitive = new Cesium.Primitive({
    geometryInstances: new Cesium.GeometryInstance({
      geometry: new Cesium.RectangleGeometry({
        rectangle: Cesium.Rectangle.fromDegrees(0, 0, 20, 20),
      }),
    }),
    appearance,
  })

  viewer.scene.primitives.add(primitive)
}

export const primitiveV = () => {
  const viewer = ViewerHelper.getViewer()!
  // viewer.scene.globe.depthTestAgainstTerrain = false

  const geometry = new Cesium.BoxGeometry({
    minimum: new Cesium.Cartesian3(0, 0, 0),
    maximum: new Cesium.Cartesian3(100000, 100000, 100000),
    vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
  })

  const instance1 = new Cesium.GeometryInstance({
    geometry,
    modelMatrix: Cesium.Matrix4.multiplyByTranslation(
      Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(-100.0, 40.0)),
      new Cesium.Cartesian3(0.0, 0.0, 0),
      new Cesium.Matrix4(),
    ),
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.TEAL),
    },
  })

  const instance2 = new Cesium.GeometryInstance({
    geometry,
    modelMatrix: Cesium.Matrix4.multiplyByTranslation(
      Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(-100.0, 40.0)),
      new Cesium.Cartesian3(0.0, 0.0, 100000.0),
      new Cesium.Matrix4(),
    ),
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.PINK),
    },
  })

  const primitive = new Cesium.Primitive({
    geometryInstances: [instance1, instance2],
    appearance: new Cesium.PerInstanceColorAppearance({
      faceForward: false,
      translucent: false,
    }),
  })

  viewer.scene.primitives.add(primitive)
}
