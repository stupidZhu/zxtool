// https://github.com/facebook/react/issues/24347
// https://github1s.com/react-component/util/blob/master/src/React/render.ts
import { CommonUtil } from "@zxtool/utils"
import React from "react"
import ReactDOM from "react-dom"
import { WithChildren } from "../../type"
import { randomStr } from "../../util"
import { reactListenHelper } from "../../util/bootstrap"
import { DefaultPortalRoot, WrapperCom, WrapperRef } from "./WrapperCom"

export interface CreatePortalHelperConfig {
  reverse: boolean
  maxCount: number
  removeDelay: number
  visibleChangeDelay: number
}

export type CreatePortalHelperP = {
  renderType: "portal"
  rootKey?: string
  className?: string
}
export type CreatePortalHelperR = {
  renderType: "render"
  rootKey?: string
  className?: string
  Provider?: React.FC<WithChildren>
}
export type CreatePortalHelperProps = CreatePortalHelperP | CreatePortalHelperR

export class CreatePortalHelper {
  private rootKey: string
  private renderType: "portal" | "render" = "render"
  private wrapperRef: { current: WrapperRef | null } = { current: null }
  private config: CreatePortalHelperConfig = { reverse: false, maxCount: 10, removeDelay: 300, visibleChangeDelay: 20 }
  PortalRoot = DefaultPortalRoot

  constructor(props: CreatePortalHelperProps = { renderType: "portal" }) {
    this.rootKey = props.rootKey ?? `portal-root-${randomStr(5)}-${Date.now()}`
    this.renderType = props.renderType
    this.init(props)
  }

  private init = (props: CreatePortalHelperProps) => {
    const Wrapper = (
      <WrapperCom
        key={this.rootKey}
        wrapperRef={this.attachWrapperRef}
        detachWrapperRef={this.detachWrapperRef}
        createPortalHelper={this}
        config={this.config}
      />
    )
    const rootDom = this.getRootDom(props.className)
    if (props.renderType === "portal") this.PortalRoot = () => ReactDOM.createPortal(Wrapper, rootDom)
    else {
      console.warn("[@zxtool/react-utils - CreatePortalHelper] renderType 推荐使用 portal 而不是 render")
      const element = props.Provider ? <props.Provider>{Wrapper}</props.Provider> : Wrapper
      // @ts-ignore
      if (ReactDOM.createRoot) {
        // @ts-ignore
        ReactDOM.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.usingClientEntryPoint = true
        // @ts-ignore
        ReactDOM.createRoot(rootDom).render(element)
        // @ts-ignore
        ReactDOM.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.usingClientEntryPoint = false
        // eslint-disable-next-line react/no-deprecated
      } else ReactDOM.render(element, rootDom)
    }
  }

  private getRootDom = (className?: string) => {
    let dom = document.querySelector(`#${this.rootKey}`)
    if (!dom) {
      dom = document.createElement("div")
      dom.id = this.rootKey
      className && dom.classList.add(className)
      document.body.appendChild(dom)
    }
    return dom as HTMLDivElement
  }

  private getWrapperRef = () => {
    let msg = "init error！"
    if (this.renderType === "portal") msg += "请检查是否将 PortalRoot 写在了组件中"

    return reactListenHelper.addListener<WrapperRef>(this.rootKey, 100).catch(() => {
      throw new Error(msg)
    })
  }

  private attachWrapperRef = (ref: WrapperRef) => {
    this.wrapperRef.current = ref
    reactListenHelper.setValue(this.rootKey, this.wrapperRef.current)
  }

  private detachWrapperRef = () => (this.wrapperRef.current = null)

  add: WrapperRef["add"] = (...rest) => this.getWrapperRef().then(wrapperRef => wrapperRef.add(...rest))

  remove = (key: string) => this.getWrapperRef().then(wrapperRef => wrapperRef.remove(key))

  clear = () => this.getWrapperRef().then(wrapperRef => wrapperRef.clear())

  setConfig = CommonUtil.genSetObjFunc(this.config)

  getKeys = () => this.getWrapperRef().then(wrapperRef => new Set(wrapperRef.keySetRef.current))
}
