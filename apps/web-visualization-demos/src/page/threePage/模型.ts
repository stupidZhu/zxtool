import { LoaderUtil } from "@zxtool/three-utils"
import { threeHelper } from "src/bootstrap"
import * as THREE from "three"

export const 加载gltf = async () => {
  const scene = threeHelper.getWidget("scene")!

  const Amlight = new THREE.AmbientLight(0xffffff, 2)
  scene.add(Amlight)

  const gltf = await LoaderUtil.loadGLTF("/model/parrot.glb")
  gltf.scene.scale.set(0.1, 0.1, 0.1)
  gltf.scene.up.set(0, 0, 1)
  gltf.scene.lookAt(new THREE.Vector3(0, 1, 0))

  scene.add(gltf.scene)
  const mixer = new THREE.AnimationMixer(gltf.scene)
  mixer.timeScale = 100
  for (let i = 0; i < gltf.animations.length; i++) {
    mixer.clipAction(gltf.animations[i]).play()
  }

  threeHelper.animationCollection.set("ani", (_, delta) => {
    mixer.update(delta)
  })
}
