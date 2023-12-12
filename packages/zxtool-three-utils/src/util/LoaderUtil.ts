import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

export const LoaderUtil = {
  gltfLoader: new GLTFLoader(),
  loadGLTF(url: string) {
    return this.gltfLoader.loadAsync(url)
  },
  textureLoader: new THREE.TextureLoader(),
  loadTexture(url: string) {
    return this.textureLoader.load(url)
  },
  loadTextureAsync(url: string) {
    return this.textureLoader.loadAsync(url)
  },
  cubeTextureLoader: new THREE.CubeTextureLoader(),
  loadCubeTexture(urls: string[]) {
    return this.cubeTextureLoader.load(urls)
  },
}
