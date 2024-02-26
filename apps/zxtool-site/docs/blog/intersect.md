---
title: 相交相关的计算
toc: content
group: WebGL
---

# 相交相关的计算

## 判断点是否在三角形内部

### 通过面积判断

- 如果点和三角形的三个顶点构成的三个三角形的面积与大三角形的面积相等, 则点在三角形内部
- 这种方法可以不用事先判断点是否与三角形共面

```ts
export const pointInTriangleV3_1 = (triangle: Vector3[], P: Vector3) => {
  const [A, B, C] = triangle

  const ab = B.clone().sub(A)
  const bc = C.clone().sub(B)
  const area2 = ab.clone().cross(bc).length() // 向量叉乘的模为构成三角形面积的两倍
  let area2_1 = 0

  for (let i = 0; i < 3; i++) {
    const P1 = triangle[i]
    const P2 = triangle[(i + 1) % 3]
    area2_1 += P1.clone().sub(P).cross(P2.clone().sub(P)).length()
  }

  return Math.abs(area2_1 - area2) <= 1e-5
}
```

### 通过叉积判断 (二维)

- 判断叉积值的正负

```ts
export const cross = (v1: Num2, v2: Num2) => {
  return v1[0] * v2[1] - v1[1] * v2[0]
}
export const pointInTriangleV2 = (triangle: Num2[], P: Num2) => {
  for (let i = 0; i < 3; i++) {
    const P1 = triangle[i]
    const P2 = triangle[(i + 1) % 3]
    const v1: Num2 = [P1[0] - P[0], P1[1] - P[1]]
    const v2: Num2 = [P2[0] - P[0], P2[1] - P[1]]
    // 顶点逆时针的情况下用 < 0, 顺时针用 > 0
    if (cross(v1, v2) < 0) return false
  }
  return true
}
```

### 通过叉积判断 (三维)

- 判断叉积是否与三角形法向量同方向 (通过叉积与法向量的点积判断)
- 这种方法需要事先判断点是否与三角形在同一平面内

```ts
export const pointInTriangleV3_2 = (triangle: Vector3[], P: Vector3) => {
  const [A, B, C] = triangle

  const ab = B.clone().sub(A)
  const bc = C.clone().sub(B)
  const n = ab.clone().cross(bc)

  for (let i = 0; i < 3; i++) {
    const P1 = triangle[i]
    const P2 = triangle[(i + 1) % 3]
    // 判断叉积是否大于等于 0
    // 三维向量叉积为法向量,需要判断 _n 和 n 是否同向, 同向则大于等于 0
    const _n = P1.clone().sub(P).cross(P2.clone().sub(P))
    const dot = _n.clone().dot(n)
    if (dot < 0) return false
  }

  return true
}
```

## 射线与平面的交点

- P = P1 + t\*v 射线表示为起点 + t倍的方向向量
- n·(P - P2) = 0 平面内的向量与平面法向量垂直(点乘为 0)

```ts
/**
 *
 * @param P1 射线起点
 * @param v 射线方向
 * @param P2 平面内一点
 * @param n 平面法向量
 */
export const rayIntersectPlane = (P1: Vector3, v: Vector3, P2: Vector3, n: Vector3) => {
  // 1: P = P1 + t*v
  // 2: n·(P - P2) = 0
  // => n·(P1 + t*v - P2) = 0
  // => t = (n·P2 - n·P1)/(n·v)
  // 若 t >= 0, 则射线与平面相交，且交点为 P(P1 + t*v), 若t < 0, 则不相交
  // 若 t = Infinity, 则射线与平面平行

  const t = (n.clone().dot(P2) - n.clone().dot(P1)) / n.clone().dot(v)
  if (t < 0 || !Number.isFinite(t)) return null
  const P = P1.clone().add(v.clone().multiplyScalar(t))
  return P
}
```

## 射线与球的交点

![射线与球的交点](./img/intersectSphere.jpg)

```ts
/**
 * 射线和球的交点
 * @param P 射线起点
 * @param v 射线方向
 * @param O 圆心
 * @param r 半径
 */
export const rayIntersectSphere = (P: Vector3, v: Vector3, O: Vector3, r: number) => {
  // cos(∠OPE) = len(PE)/len(PO) 求出 PE 长度
  // sin(∠OPE) = len(OE)/len(PO) 求出 OE 长度
  // 勾股定理 求出 P1E 长度
  // t = len(PE)-len(P1E) | len(PE)+len(P1E)

  const po = O.clone().sub(P)
  const po_l = po.length()
  const po_n = po.clone().normalize()

  const sin = v.clone().cross(po_n).length()
  const oe_l = po_l * sin
  if (oe_l > r) return null

  const cos = po_n.clone().dot(v)
  if (cos <= 0) return null // 只可能在射线反方向相交
  const pe_l = po_l * cos

  const p1e_l = Math.sqrt(r ** 2 - oe_l ** 2)

  if (p1e_l <= 1e-5) {
    return [P.clone().add(v.clone().multiplyScalar(pe_l))]
  }

  return [P.clone().add(v.clone().multiplyScalar(pe_l - p1e_l)), P.clone().add(v.clone().multiplyScalar(pe_l + p1e_l))]
}
```

## 应用

用于射线拾取: 先检测射线是否与几何体的包围球相交, 如果相交则遍历几何体的三角面判断是否与几何体相交或者求出相交点
