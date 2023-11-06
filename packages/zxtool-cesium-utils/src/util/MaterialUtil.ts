import { IObj } from "@zxtool/utils/dist/type"
import * as Cesium from "cesium"

interface MaterialTemplate {
  fabric: {
    type: string
    source: string
    uniforms?: IObj<unknown>
  }
  translucent: boolean | (() => boolean)
}

interface MaterialPropertyUtil {
  defined(value: any): boolean
  equals(left: any, right: any): any
  arrayEquals(left: any[], right: any[]): boolean
  isConstant(property: any): boolean
  getValueOrUndefined(property: any, time: any, result: any): any
  getValueOrDefault(property: any, time: any, valueDefault: any, result: any): any
  getValueOrClonedDefault(property: any, time: any, valueDefault: any, result: any): any
  createPropertyDescriptor(name: any, configurable?: any, createPropertyCallback?: any): any
  addMaterial(type: string, materialTemplate: MaterialTemplate): void
}

const Util: MaterialPropertyUtil = {
  defined: Cesium.defined,
  equals: (Cesium.Property as any).equals,
  arrayEquals: (Cesium.Property as any).arrayEquals,
  isConstant: (Cesium.Property as any).isConstant,
  getValueOrUndefined: (Cesium.Property as any).getValueOrUndefined,
  getValueOrDefault: (Cesium.Property as any).getValueOrDefault,
  getValueOrClonedDefault: (Cesium.Property as any).getValueOrClonedDefault,
  createPropertyDescriptor: (Cesium as any).createPropertyDescriptor,
  addMaterial(type, materialTemplate) {
    // @ts-ignore
    Cesium.Material._materialCache.addMaterial(type, materialTemplate)
  },
}

export default Util
