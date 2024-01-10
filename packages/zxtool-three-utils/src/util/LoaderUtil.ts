import * as THREE from "three"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js"

const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
const rgbeLoader = new RGBELoader()
const dracoLoader = new DRACOLoader()
const gltfLoader = new GLTFLoader()

dracoLoader.setDecoderPath("/draco/")
gltfLoader.setDRACOLoader(dracoLoader)

export const LoaderUtil = {
  textureLoader,
  cubeTextureLoader,
  rgbeLoader,
  dracoLoader,
  gltfLoader,
}
