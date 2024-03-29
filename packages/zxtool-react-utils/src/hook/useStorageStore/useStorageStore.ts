import { StorageHelper } from "@zxtool/utils"
import { IObj } from "@zxtool/utils/dist/type"
import { useEffect, useMemo } from "react"
import { useConfigContext } from "../../component/ConfigProvider/ConfigProvider"
import { reactStorageHelper } from "../../util/bootstrap"
import { useStoreState } from "../useStoreState/useStoreState"

export const useStorageStore = <T extends IObj>(key: string, defaultValue?: T, customStorageHelper?: StorageHelper) => {
  const { storageHelper: _storageHelper } = useConfigContext() ?? {}
  const storageHelper = useMemo(
    () => customStorageHelper ?? _storageHelper ?? reactStorageHelper,
    [_storageHelper, customStorageHelper],
  )

  const storeObj = useStoreState<T>({ ...(defaultValue ?? {}), ...storageHelper.getItem<T>(key) } as T)

  useEffect(() => {
    storageHelper.setItem(key, storeObj[0])
  }, [key, storageHelper, storeObj])

  return storeObj
}
