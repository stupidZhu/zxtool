---
debug: true
title: 三角剖分和三角网格细分
toc: content
group: WebGL
---

# 三角剖分和三角网格细分

## 三角剖分

简单实现一下耳切法三角剖分, 因为 WebGL 中常定义逆时针为正方向, 这里就考虑多边形为逆时针的情况

- 三个点为一组, 如果三个点构成的三角形为逆时针方向, 且三角形中不包含其他点, 则这个三角形为一个 ear, 移除中间的点
- 直到只剩三个点, 结束递归
- 下面简单的实现只支持逆时针的 polygon, 且第一个顶点不能等于最后一个顶点(首尾不能相同)
- 在生产环境中请使用 [earcut](https://www.npmjs.com/package/earcut)

```ts
export const cross = (v1: Num2, v2: Num2) => {
  return v1[0] * v2[1] - v1[1] * v2[0]
}
export const pointInTriangleV2 = (triangle: Tuple3<number[]>, P: number[]) => {
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

export const polygon2mesh = (polygon: number[][]) => {
  const points = [...polygon]
  const pointMap = new Map<number[], number>()
  points.forEach((item, index) => pointMap.set(item, index))

  const indices: number[] = []

  // 三角形中是否包含其他顶点
  const include = (triangle: Tuple3<number[]>) => {
    for (const point of points) {
      if (triangle.includes(point)) continue
      if (pointInTriangleV2(triangle, point)) return true
    }
    return false
  }

  const rec = (i: number) => {
    const i0 = i % points.length
    const i1 = (i + 1) % points.length
    const i2 = (i + 2) % points.length

    const [A, B, C] = [points[i0], points[i1], points[i2]]

    if (points.length === 3) {
      indices.push(pointMap.get(A)!, pointMap.get(B)!, pointMap.get(C)!)
      return
    }

    const ab: Num2 = [B[0] - A[0], B[1] - A[1]]
    const bc: Num2 = [C[0] - B[0], C[1] - B[1]]

    // 如果三角形是逆时针, 并且三角形内部不包含其他点
    if (cross(ab, bc) > 0 && !include([A, B, C])) {
      indices.push(pointMap.get(A)!, pointMap.get(B)!, pointMap.get(C)!)
      points.splice(i1, 1)
    }

    rec(i1)
  }

  rec(0)

  return indices
}
```

## 三角网格细分

### Loop Subdivision

- 简单实现 Loop Subdivision, 只考虑平面的情况(只细分,不更新顶点位置)
- 具体可以参考 [GAMES101](https://www.bilibili.com/video/BV1X7411F744)
- 生产环境考虑使用 [three-subdivide](https://www.npmjs.com/package/three-subdivide)

```ts

```
