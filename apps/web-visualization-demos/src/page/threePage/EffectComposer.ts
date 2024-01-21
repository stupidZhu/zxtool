import { threeHelper } from "src/bootstrap"
import * as THREE from "three"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js"
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js"

export const 发光 = () => {
  const scene = threeHelper.getWidget("scene")!
  const renderer = threeHelper.getWidget("renderer")!
  const camera = threeHelper.getWidget("camera")!

  const geometry = new THREE.SphereGeometry(1, 32, 32)
  const material = new THREE.MeshBasicMaterial({ color: "teal" })
  const sphere = new THREE.Mesh(geometry, material)
  sphere.position.set(-5, 0, 0)
  scene.add(sphere)

  const geometry2 = new THREE.BoxGeometry(1, 1, 1)
  const cube = new THREE.Mesh(geometry2, material)
  cube.position.set(5, 0, 0)
  scene.add(cube)

  const geometry3 = new THREE.TorusKnotGeometry(0.6, 0.15, 100, 16)
  const torusKnot = new THREE.Mesh(geometry3, material)
  scene.add(torusKnot)

  const composer = new EffectComposer(renderer)
  composer.setSize(window.innerWidth, window.innerHeight)
  composer.setPixelRatio(window.devicePixelRatio)

  const renderPass = new RenderPass(scene, camera)
  composer.addPass(renderPass)

  const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera)
  composer.addPass(outlinePass)

  outlinePass.selectedObjects = [sphere, cube, torusKnot]

  threeHelper.animationCollection.delete(Symbol.for("update_renderer"))
  threeHelper.animationCollection.set("update_renderPass", {
    fn: ({ delta }) => {
      composer.render(delta)
    },
  })
}
