import { StorageHelper } from "@zxtool/utils"
import React, { PropsWithChildren, createContext, useContext } from "react"
import { reactStorageHelper } from "../../util/bootstrap"
import useDialogField from "./useDialogField"

interface ConfigContextDialogField {
  getMaxZIndex(): string
  getMinZIndex(): string
  addKey(key: PropertyKey): void
  delKey(key: PropertyKey): void
}

interface ConfigContextType {
  dialogField: ConfigContextDialogField
  storageHelper: StorageHelper
}

const ConfigContext = createContext<ConfigContextType | null>(null)

export interface ConfigProviderProps extends PropsWithChildren {
  initialZIndex?: number
  storageHelper?: StorageHelper
}

export const ConfigProvider: React.FC<ConfigProviderProps> = props => {
  const { children, initialZIndex = 1000, storageHelper = reactStorageHelper } = props
  const { addKey, delKey, getMaxZIndex, getMinZIndex } = useDialogField(initialZIndex)

  return (
    <ConfigContext.Provider value={{ dialogField: { getMaxZIndex, getMinZIndex, addKey, delKey }, storageHelper }}>
      {children}
    </ConfigContext.Provider>
  )
}

export const useConfigContext = () => {
  const context = useContext(ConfigContext)
  if (!context)
    console.warn("[@zxtool/react-utils - ConfigProvider] 请使用 ConfigProvider 以体验 @zxtool/react-utils 完整功能。")
  return context
}
