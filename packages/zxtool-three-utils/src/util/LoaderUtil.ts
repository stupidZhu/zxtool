import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js"

export const LoaderUtil = {
  gltfLoader: new GLTFLoader(),
  textureLoader: new THREE.TextureLoader(),
  cubeTextureLoader: new THREE.CubeTextureLoader(),
  rgbeLoader: new RGBELoader(),
}
