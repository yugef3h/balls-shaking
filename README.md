## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

## 前言

最近抽出时间学习 webgl 3D ，忙着学习无法自拔，说实话，当初看到 github 登陆图时我真的很震撼！

说完，笔者朝你丢了张它的静态图，我的计划是实现它...

<div style="width: 35%;">

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8fa08430c8f34a8ca079cb31cd9439ba~tplv-k3u1fbpfcp-watermark.image)

</div>

不过，今天咱们讲的是 “扭扭乐抽奖小游戏” (\*￣︶￣)

文本涉及的技术栈 Vue3、TypeScript、Canvas ...

如果你还不了解 Canvas，这里是一篇入门：[传送门](https://juejin.cn/post/6899793895433961486)

Emmm，身为强迫症，我个人对这个小游戏并不满意，代码和动画，各个方面不想列举，所以发出来和大家一起探讨一下。没什么别的原因，主要是掘金这里个个是人才，说话又好听（路过的大佬带带我）...

`正经`：**以下如有错误的思路和解法、可优化改进的地方等，请各位不吝指正，学习使我快乐...**

## UI

完整静态图：

<div style="width: 50%;">

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d29f6d982620461788eb8e9d292329bc~tplv-k3u1fbpfcp-watermark.image)

</div>

PS：18 号真的有开奖，忙于滑雪忘记帮公司引流了，日流水近千万的小程序，仔细逛逛里面还有别的小游戏噢...

<div style="width: 150px; display: flex;">

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fc651d0ff1ac4501939e9e3b0b89fe2b~tplv-k3u1fbpfcp-watermark.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/12afa155e7e141d28659f00e4c118330~tplv-k3u1fbpfcp-watermark.image)

</div>

## 方案

我设计了两种模式：一种俯瞰碰撞视角、一种侧看不碰撞版。

**touchStart** 旋钮超过 300ms 视为长按，按钮顺时针开始旋转，同时 `“奖球窗口”` 动画开始，长按结束旋钮会慢慢恢复，直到回到原点 `“奖球窗口”` 动画结束。

旋钮回到原点的时候，`“结果窗口”` 开始动画，落下一个小奖球。

<div style="width: 50%;">

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a5e940d6c951494fb22de50756958b7a~tplv-k3u1fbpfcp-watermark.image)

</div>

## 案例分析

### 1. 参数配置，后期灵活调整：

```js
const shakingOptions = reactive({
  ballCount: 15, // 奖球数量
  ballRadius: 40, // 奖球半径
  mode: 1, // 不碰撞版本
  speed: 4, // 限制速度的上限
  tagName: 'egg-wrapper' // 画布 id
})
```

### 2. 刚进页面画布不能空空的：

- 要么：在画布底层配置一张背景图
- 要么：动画绘制一张静态图（Emmm，我选了这种...）

```js
/**
 * 参数说明：imgData 4种奖球、o 画布资源、balls 奖球实例数组
 */
initCanvasBalls({ ...shakingOptions, imgData, o, balls })
```

### 3. 监听旋钮旋转，触发一系列后续事件：

```js
rotateSwitchObserver({
  tagName: '.switch', // 旋钮 tagName
  rotateId: rotateId.value, // 定时器 id
  startEvent: () => {
    // 长按开始执行奖球动画同时清除上次的结果
    shakingAnim(shakingOptions) // 使画布开始动画的真正主函数
    o.result && o.context?.clearRect(0, 0, o.result?.width, o.result?.height) // 清除结果窗口
  },
  endEvent: () => getResult(shakeId.value) // 长按归位后回调
})
```

### 4. 接口请求控制结果

```js
// 这里暂时控制小球的颜色，从接口中拿
const luckyObj = reactive({
  bgIndex: imgData['egg1']
  ... // 其他参数可以用接口获取中奖编号，奖品，日期，小球颜色等其他数据
})
```

## 碰撞计算

这里尝试了两种，`实测复杂版更严谨，但都有缺陷`：可活动的空间越小，越容易出现嵌入边界的情况。

还是拿前面的 `shakingOptions` 参数来讲：

```js
/**
 * 参数说明：
 * 因为 canvas 的空间有限，假若 ballCount 和 ballRadius 数值都很大
 * 依旧可能出现粘连和陷入墙里 （边界）的情况，所以 shakingOptions 参数请好好权衡。
 * ballCount 球的数量很大时，ballRadius 半径适当缩小
 * 当然假如 type = 1 非碰撞模式时，影响可以忽略
 */
const shakingOptions = reactive({
  ballCount: 15, // 奖球数量
  ballRadius: 40, // 奖球半径
  mode: 1, // 不碰撞版本
  speed: 4, // 限制速度的上限
  tagName: 'egg-wrapper' // 画布 id
})
```

所以，还是 `不碰撞版` 香啊，每个奖球都享有整个画布的 moment，而且还有一种自欺欺人的 3D 感。

让你们感受下 2D 的世界，人挤人啊！

<div style="width: 50%;">

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/08b75bd1bea34301815ac641182351d1~tplv-k3u1fbpfcp-watermark.image)

</div>

### 碰撞简单版

碰撞后直接交换速度。

```js
// 两两对比，循环对比的算法还可以优化
exchangeVelocity(ball, anotherBall)

export const exchangeVelocity = (ball: Ball, anotherBall: Ball) => {
  ;[ball.vx, ball.vy, anotherBall.vx, anotherBall.vy] = [
    anotherBall.vx,
    anotherBall.vy,
    ball.vx,
    ball.vy
  ]
}
```

### 碰撞复杂版

碰撞后计算相对速度与法线的点积，再进行交换。

```js
exchangeRelativeVelocity(ball, anotherBall, distance)

export const exchangeRelativeVelocity = (
  ball: Ball,
  anotherBall: Ball,
  distance: number
) => {
  // 计算法线单位向量
  const nx = (ball.x - anotherBall.x) / distance,
    ny = (ball.y - anotherBall.y) / distance
  // 相对速度
  const dvx = ball.vx - anotherBall.vx,
    dvy = ball.vy - anotherBall.vy
  // 相对速度与法线的点积
  const dp = nx * dvx + ny * dvy
  // 更新碰撞后的速度
  ball.vx -= dp * nx
  ball.vy -= dp * ny
  anotherBall.vx += dp * nx
  anotherBall.vy += dp * ny
}
```

## 性能优化

- polyfill 的 `requestAnimationFrame.ts` 循环动画 API
- 离屏缓冲区加载图片等资源
- 类组件封装，比如 `createBalls` 根据传入的速度区分静态和动态、`drawCircle` 绘制动画，补充了一些 @types，响应式 `resize` 监听 `updateCanvasRender` ，长按类 `LongTap` ，正旋/逆旋等函数。

```js
export const updateCanvasRender = (
  globalOptions: number[]
): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      updateCanvasSize(
        // 遍历 tag 触发响应
        ['egg-wrapper', 'result-window'],
        globalOptions
      )
      resolve(true)
    }, 100)
  })
}
```

其他省略，这里就不放了...

还有一些中规中矩的点：

- canvas 避免浮点数的坐标
- 尽量少的改变状态机 ctx 的里状态
- 尽量利用 CSS，比如背景图

## 待改进

待改进的地方还蛮多的，简单说：
- 分层：可以考虑拆除多个 canvas 来做
- 减少属性设置：我这里直接封装了 arc、fill， 其实增加了性能消耗
- 离屏绘制：这倒是可以解决上一点，arc、fill 在每次绘制时会有延迟，而当我们绘制图片 drawImage 时，性能明显会好上很多。drawImage 除了直接绘图片外，还能绘制另一个 Canvas，所以我们提前将这些点画到一个不在屏幕上的 Canvas 里就可以同理解决延迟问题了。
- 减少 js 计算：避免堵塞进程，可以使用 web worker，当然咱们目前的计算完全用不上这个。



项目中比如：
- 渲染绘制的 API 频繁调用，改进空间有，说白了还是代码不够优雅
- 自定义配置还可以加入：具体颜色的分配，比如 红球 5 个，蓝球 4 个...
- 长按类 `LongTap` 加入其它的钩子，比如监听事件的移除
- 顺逆旋钮的倍速放慢
- 旋钮圈数增加，现在限制了一圈，有时间优化吧
- 动画的过渡效果改进
- 静态图假如是 canvas 生成的话，可以设计成从中间散开 543212345，1 在最前。
- 其他...

当然，程序开发在短时间内是无法做到完善的，要懂得妥协、及时刹车！

## 结语

以上就是大概的实现思路了，有些地方还是略显粗糙的；另外从整体的描述来看，一些说明和更详细的备注都没有贴出来，还是需要结合源码去跑一下，不然没有太直接的代入感；到最后也是希望能抛砖引玉，探讨下多种实现方法。

好了，内容到这里就结束了。

如果你觉得这篇内容对你挺有启发，记得点个 `赞` 丫，让更多的人也能看到这篇内容，拜托啦，这对我真的很重要。

笔者不小心在这里落下一大段源码 [扭扭乐抽奖 github 地址](https://github.com/yugef3h/balls-shaking) 。

## 往期精选

[「中高级前端面试」手写代码合集](https://juejin.cn/post/6902060047388377095)

[TLS 握手流程详解](https://juejin.cn/post/6895624327896432654)

