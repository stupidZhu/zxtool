/**
 * title : 使用示例
 * desc : 对象数组状态管理
 */

import { useObjList } from "@zxtool/react-utils"
import { Button, Form, Input, InputNumber, Radio } from "antd"
import React from "react"
import "./index.scss"

const BaseDemo = () => {
  const { list, setList, add, del, edit } = useObjList<{ id: string; name: string; age: number; gender: boolean }>()
  const [form] = Form.useForm()

  return (
    <div>
      <Form form={form} layout="inline" onFinish={({ addType, ...value }) => add({ value, addType })}>
        <Form.Item label="姓名" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="年龄" name="age" rules={[{ required: true }]}>
          <InputNumber />
        </Form.Item>
        <Form.Item label="性别" name="gender" rules={[{ required: true }]}>
          <Radio.Group
            options={[
              { label: "男", value: true },
              { label: "女", value: false },
            ]}
          ></Radio.Group>
        </Form.Item>
        <Form.Item label="新增方式" name="addType" rules={[{ required: true }]}>
          <Radio.Group
            options={[
              { label: "push", value: "push" },
              { label: "unshift", value: "unshift" },
            ]}
          ></Radio.Group>
        </Form.Item>
        <Button htmlType="submit">新增</Button>
      </Form>

      {list.map((item, index) => {
        return (
          <div key={item.id} className="obj-item">
            <div className="form-item">
              <span>姓名: </span>
              <Input value={item.name} onChange={e => edit({ index, value: { name: e.target.value } })} />
            </div>
            <div className="form-item">
              <span>年龄: </span>
              <InputNumber value={item.age} onChange={e => edit({ index, value: { age: e! } })} />
            </div>
            <div className="form-item">
              <span>年龄: </span>
              <Radio.Group
                value={item.gender}
                onChange={e => edit({ index, value: { gender: e.target.value } })}
                options={[
                  { label: "男", value: true },
                  { label: "女", value: false },
                ]}
              ></Radio.Group>
            </div>
            <span style={{ cursor: "pointer" }} onClick={() => del({ index })}>
              X
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default BaseDemo
