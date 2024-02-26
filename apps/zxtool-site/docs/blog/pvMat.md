---
title: 视图矩阵和投影矩阵的推导
toc: content
group: WebGL
---

# 视图矩阵和投影矩阵的推导

## 视图矩阵 (viewMatrix)

- 视图矩阵就是 lookAt 的逆矩阵
- lookAt: 先旋转, 后位移

```ts
const lookAt = (eye: Vector3, target: Vector3, up: Vector3) => {
  const zAxis = new Vector3().subVectors(eye, target).normalize()
  const xAxis = new Vector3().crossVectors(up, zAxis).normalize()
  //基向量 yAxis，修正上方向
  const yAxis = new Vector3().crossVectors(zAxis, xAxis).normalize()
  // const mat4=new Matrix4().set(
  //   xAxis.x,yAxis.x,zAxis.x,eye.x,
  //   xAxis.y,yAxis.y,zAxis.y,eye.y,
  //   xAxis.z,yAxis.z,zAxis.z,eye.z,
  //   0,0,0,1
  // )
  // prettier-ignore
  const moveMat = new Matrix4().set(
    1, 0, 0, eye.x, 
    0, 1, 0, eye.y, 
    0, 0, 1, eye.z, 
    0, 0, 0, 1
  )
  // prettier-ignore
  const rotateMat = new Matrix4().set(
    xAxis.x,yAxis.x,zAxis.x,0,
    xAxis.y,yAxis.y,zAxis.y,0,
    xAxis.z,yAxis.z,zAxis.z,0,
    0,0,0,1
  )

  return new Matrix4().multiplyMatrices(moveMat, rotateMat)
}
```

## 正交投影矩阵 (projectionMatrix - OrthographicMatrix)

- 先将绘制区域移动到坐标原点, 然后将绘制区域缩放到投影空间
- 经过视图矩阵变换, 相机位于坐标原点, 看向 z 轴负方向, n 和 f 实际上应该是负值

```
// 位移矩阵 * 缩放矩阵
[
  2/(r-l),0,0,0
  0,2/(t-b),0,0,
  0,0,2/(f-n),0, // n,f 取负得到 2/(n-f)
  0,0,0,1
] *
[
  1,0,0,(l+r)*-0.5
  0,1,0,(b+t)*-0.5,
  0,0,1,(n+f)*-0.5, // n,f 取负得到 (n+f)*0.5
  0,0,0,1
]
```

```ts
const getOrthographicMat = (l: number, r: number, t: number, b: number, n: number, f: number) => {
  return multiplyMats(
    new Matrix4().makeScale(2 / (r - l), 2 / (t - b), 2 / (n - f)),
    new Matrix4().makeTranslation((l + r) * -0.5, (b + t) * -0.5, (n + f) * 0.5),
  )
}
```

## 透视投影矩阵 (projectionMatrix - PerspectiveMatrix)

将视锥体远裁截面压缩得和近裁截面一样大(用到齐次坐标, 先将这个矩阵称为 PressMatrix), 再乘以正交投影矩阵

0. 先将根据条件求出 l, r, t, b, n, f

1. 缩小远裁截面
   <br/> ![perspectiveMat](./img/perspectiveMat.png)<br/>
   可以得到 P1.x/P2.x=P1.y/P2.y=P1.z/P2.z; P2.z = n, 所以如果想要将P1变到P2, 需要除以 P2.z/n, 可以得到齐次坐标为 `P2.z/n`

   根据上面的条件可以算出 PressMatrix 的第四行

   ```
   [
     _,_,_,_,
     _,_,_,_,
     _,_,_,_,
     a,b,c,d,
   ] * [x, y, z, w]
   => ax+by+cz+dw = z/n
   => c = 1/n; a=b=d=0
   ```

2. 应用齐次坐标后就能得到转换后的x,y值(不存在其他的旋转平移缩放),所以可以确定矩阵前两行

   ```
   [
     1,0,0,0,
     0,1,0,0,
     _,_,_,_,
     0,0,1/n,0
   ]
   ```

3. 应用齐次坐标后会导致 z 的值也会缩小,而 z 方向的缩放应该在`正交投影矩阵`里面进行, 还需要对 z 做一些变换

   ```
   [
     _,_,_,_,
     _,_,_,_,
     a,b,c,d,
     _,_,_,_,
   ] * [x, y, z, w]
   得到变换后的z坐标 => ax+by+cz+dw
   应用齐次坐标 => (ax+by+cz+1d)*(n/z)
   可以得到两个等式 =>

   1. (ax+by+c*n+d)*(n/n) = n (z 等于 n 时, 计算出的 z 值为 n, 近裁截面不变)
   2. (ax+by+c*f+d)*(n/f) = f (z 等于 f 时, 计算出的 z 值为 f, 远裁截面不变)
   =>

   1. ax+by+d = n-cn
   2. ax+by+d = f^2/n - cf

   => n-cn = f^2/n - cf
   => cf-cn = (f^2-n^2)/n
   => c = (f+n)/n

   将上式代入 ax+by+d = n-cn
   => ax+by+d = -f
   => d = -f

   得到矩阵
   =>
   [
     1,0,0,0,
     0,1,0,0,
     0,0,(n+f)/n,-f,
     0,0,1/n,0
   ]
   ```

4. 经过视图矩阵变换, 相机位于坐标原点, 看向 z 轴负方向, n 和 f 实际上应该是负值

   齐次坐标的特性可以给这个矩阵乘以一个数, 通常会乘以 n, 这样的话经过变换以后 gl_Position 的 w 分量就刚好等于 -z, 而此时相机在坐标原点, 顶点都在 z 轴负方向, w 就可以代表视点到该顶点的距离, 方便某些计算

   ```
   [
     1,0,0,0,
     0,1,0,0,
     0,0,(n+f)/n,f,
     0,0,1/-n,0
   ]
   =>
   [
     n,0,0,0,
     0,n,0,0,
     0,0,n+f,n*f,
     0,0,-1,0
   ]
   ```

5. 上面得到一个变换视锥体的矩阵 PressMatrix,左乘以`正交投影矩阵`得到透视投影矩阵
   => getOrthographicMat(l, r, t, b, n, f)\*PressMatrix

```ts
const getPerspectiveMat = (fov: number, aspect: number, near: number, far: number) => {
  const [n, f] = [near, far]
  const halfFov = MathUtils.degToRad(fov) * 0.5
  const t = near * Math.tan(halfFov)
  const height = t * 2
  const width = aspect * height

  // prettier-ignore
  const _mat = new Matrix4().set(
    n,0,0,0,
    0,n,0,0,
    0,0,n+f,n*f,
    0,0,-1,0
  )

  const orthographicMat = getOrthographicMat(width * -0.5, width * 0.5, t, -t, n, f)
  return new Matrix4().multiplyMatrices(orthographicMat, _mat)
}
```
