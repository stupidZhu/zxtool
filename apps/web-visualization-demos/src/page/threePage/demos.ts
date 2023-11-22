import GUI from "lil-gui"
import { threeHelper } from "src/bootstrap"
import * as THREE from "three"

export const clipping = () => {
  const scene = threeHelper.getWidget("scene")!
  const renderer = threeHelper.getWidget("renderer")!
  renderer.shadowMap.enabled = true

  const dirLight = new THREE.DirectionalLight("white", 2)
  dirLight.position.set(0, 5, 0)
  dirLight.castShadow = true
  scene.add(dirLight)
  const spotLight = new THREE.SpotLight("white", 60)
  spotLight.castShadow = true
  spotLight.position.set(2, 4, 2)
  scene.add(spotLight)
  scene.add(new THREE.AmbientLight("white", 2))

  const localPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0.8)
  const localPlaneHelper = new THREE.PlaneHelper(localPlane, 5, "pink")
  scene.add(localPlaneHelper)

  const globalPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0))
  const globalPlaneHelper = new THREE.PlaneHelper(globalPlane, 10, "skyblue")
  scene.add(globalPlaneHelper)

  const geom = new THREE.TorusKnotGeometry(0.4, 0.08, 95, 20)
  const material = new THREE.MeshLambertMaterial({
    color: "teal",
    clippingPlanes: [localPlane],
    clipShadows: true,
    side: THREE.DoubleSide,
  })
  const mesh = new THREE.Mesh(geom, material)
  mesh.position.y = 0.8
  mesh.castShadow = true
  scene.add(mesh)

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshLambertMaterial({ color: "gray", side: THREE.DoubleSide }),
  )
  ground.receiveShadow = true
  ground.rotation.x = -Math.PI / 2
  scene.add(ground)

  renderer.clippingPlanes = [globalPlane]
  renderer.localClippingEnabled = true

  const gui = new GUI()

  gui.add(localPlane, "constant", 0.2, 1.6, 0.01).name("local_constant")
  gui.add(localPlaneHelper, "visible").name("local_visible")
  gui.add(globalPlane, "constant", -0.8, 0.8, 0.01).name("global_constant")
  gui.add(globalPlaneHelper, "visible").name("global_visible")

  threeHelper.addToAnimation("rotate", time => {
    mesh.rotation.x = time * 0.001 * 0.5
    mesh.rotation.y = time * 0.001 * 0.5
  })
}

// export const 墙=()=>{

// }
