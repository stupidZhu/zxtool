import * as THREE from "three"
import { DRACOLoader, GLTFLoader, RGBELoader } from "three/examples/jsm/Addons.js"

const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
const rgbeLoader = new RGBELoader()
const dracoLoader = new DRACOLoader()
const gltfLoader = new GLTFLoader()
const fileLoader = new THREE.FileLoader()

dracoLoader.setDecoderPath("/draco/")
gltfLoader.setDRACOLoader(dracoLoader)

export const LoaderUtil = {
  textureLoader,
  cubeTextureLoader,
  rgbeLoader,
  dracoLoader,
  gltfLoader,
  fileLoader,
}
