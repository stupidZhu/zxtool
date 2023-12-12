import { ThreeHelper } from "src/bootstrap"
import * as THREE from "three"

export const 随机三角形 = () => {
  const scene = ThreeHelper.getWidget("scene")!

  const num = 80

  for (let i = 0; i < num; i++) {
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(9)
    for (let i = 0; i < 9; i++) {
      positions[i] = (Math.random() - 0.5) * 50
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    const color = new THREE.Color(Math.random(), Math.random(), Math.random())
    const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5 })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
  }
}
