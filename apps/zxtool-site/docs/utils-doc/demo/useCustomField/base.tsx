/**
 * title: 基础用法
 * desc: 实现一个新增用户的 demo
 */

import { useCustomFields } from "@zxtool/react-utils"
import { CtrlProps } from "@zxtool/react-utils/dist/type"
import { IKey } from "@zxtool/utils/dist/type"
import { Button, Input, InputNumber, Switch } from "antd"
import classNames from "classnames"
import React, { useState } from "react"
import "./index.scss"

export type FieldItem = { id: IKey; name: string; age?: number; gender?: boolean }

const BaseDemo: React.FC<CtrlProps<FieldItem[]>> = props => {
  const [editKey, setEditKey] = useState<IKey>("")
  const { fields, addField, editField, delField, validate } = useCustomFields<FieldItem>({
    templateItem: { name: "" },
    validateItem(item) {
      return !!item.name
    },
    onAction(info) {
      const { field, type, flag, message } = info
      if ((!flag || type === "add") && field?.id) setEditKey(field.id)
      if (!flag && message) alert(message)
    },
    ...props,
  })

  return (
    <div className="custom-field">
      <Button size="small" type="primary" block disabled={!!editKey} onClick={() => addField(undefined, "unshift")}>
        新增 - unshift
      </Button>
      {fields.map(item => {
        return (
          <div className={classNames("field-item", { editing: editKey === item.id })} key={item.id}>
            <Input value={item.name} onChange={e => editField({ ...item, name: e.target.value })} />
            <InputNumber value={item.age} onChange={e => editField({ ...item, age: e! })} style={{ width: 200 }} />
            <Switch checked={item.gender} onChange={e => editField({ ...item, gender: e })} />
            {editKey === item.id ? (
              <i
                className="iconfont pop-iconsave-fill"
                onClick={() => {
                  setEditKey("")
                  validate([item])
                }}
              />
            ) : (
              <>
                <i
                  className="iconfont pop-iconedit-fill"
                  onClick={() => {
                    setEditKey(item.id)
                    validate(undefined, [item])
                  }}
                />
                <i className="iconfont pop-icondelete-fill" onClick={() => delField(item)} />
              </>
            )}
          </div>
        )
      })}
      <Button size="small" type="primary" block disabled={!!editKey} onClick={() => addField()}>
        新增 - push
      </Button>
      <Button
        size="small"
        type="primary"
        block
        disabled={!!editKey}
        onClick={() => {
          addField({ name: "aaa" })
          addField({ name: "bbb" })
          addField({ name: "ccc" })
        }}
      >
        传入添加参数
      </Button>
      <Button size="small" type="primary" block disabled={!!editKey} onClick={() => console.log(fields)}>
        打印数据
      </Button>
    </div>
  )
}

export default BaseDemo
