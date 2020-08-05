import { debounce } from 'lodash'
export const getCanvasElementById = (id: string): HTMLCanvasElement => {
  const canvas = document.getElementById(id)
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error(
      `The element of id "${id}" is not a HTMLCanvasElement. Make sure a <canvas id="${id}""> element is present in the document.`
    )
  }
  return canvas
}

export const getHTMLElement = (tagName: string): HTMLElement => {
  const node = document.querySelector(tagName)
  if (!(node instanceof HTMLElement)) {
    throw new Error(`The element of tagName "${tagName}" is not a HTMLElement.`)
  }
  return node
}

export const getCanvasRenderingContext2D = (
  canvas: HTMLCanvasElement
): CanvasRenderingContext2D => {
  const context = canvas.getContext('2d')
  if (context === null) {
    throw new Error(
      'This browser does not support 2-dimensional canvas rendering contexts.'
    )
  }
  return context
}

export const xRandomInt = (nMax: number, nMin = 0): number => {
  const nRandomInt = Math.floor(Math.random() * (nMax - nMin + 1)) + nMin
  return nRandomInt
}

export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string
) => {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2, false)
  ctx.fill()
}

export class Ball {
  x: number // 圆心
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  bgIndex: number
  constructor(
    x: number,
    y: number,
    vx: number,
    vy: number,
    radius: number,
    color: string,
    bgIndex: number
  ) {
    this.x = x
    this.y = y
    this.vx = vx
    this.vy = vy
    this.radius = radius
    this.color = color
    this.bgIndex = bgIndex
  }
  // 保持在画布内活动
  update(cvw: number, cvh: number) {
    if (this.x >= cvw - this.radius || this.x <= 0 + this.radius) {
      this.vx *= -1
    }
    if (this.y >= cvh - this.radius || this.y <= 0 + this.radius) {
      this.vy *= -1
    }
  }
}

export const dist = (obj1: Ball, obj2: Ball) =>
  Math.sqrt((obj1.y - obj2.y) ** 2 + (obj1.x - obj2.x) ** 2)

export const randNum = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min)

export const randFloatNum = (min: number, max: number, fix = 1) =>
  parseFloat((Math.random() * (max - min + 1) + min).toFixed(fix))

export * from '@/types/requestAnimationFrame'

export const getImgList = (imgData: any): Element[] => {
  const { winEgg, ...eggList } = imgData
  // 屏蔽报错
  if (!winEgg) console.log()
  const nodeList: Element[] = []
  Object.keys(eggList).forEach(egg => {
    const node = document.querySelector(`.${egg}`)
    node && nodeList.push(node)
  })
  return nodeList
}

/**
 * type 类型：1.default 不碰撞，2.collision 碰撞，其他参数一律为 1
 */
export interface BallObject {
  ballCount: number // 小球数量
  ballRadius?: number // 小球半径
  speed?: number // 小球速度
  type?: string | number
}

// 创建并过滤位置有误的小球，比如两个黏在一起的，属于碰撞模式优化...
export const createBalls = (
  balls: Ball[],
  ballCount: number,
  ballRadius: number,
  ballColor: string,
  cvw: number,
  cvh: number,
  speed: number,
  _collideBool: boolean,
  nodeList: Element[]
) => {
  let _ball, intersect
  while (balls.length < ballCount) {
    const x = xRandomInt(ballRadius, cvw - ballRadius)
    const y = xRandomInt(ballRadius, cvh - ballRadius)
    const vx = _collideBool ? 0 : randNum(3, speed)
    const vy = _collideBool ? 0 : randNum(3, speed)
    const bgIndex = randNum(0, nodeList.length - 1) // 挂载背景图片的 index
    _ball = new Ball(x, y, vx, vy, ballRadius, ballColor, bgIndex)

    intersect = false
    for (const b of balls) {
      if (dist(b, _ball) <= b.radius + _ball.radius) {
        intersect = true
        break
      }
    }

    // 当前这个舍弃
    if (intersect && _collideBool) continue
    if (_collideBool) _ball.vx = _ball.vy = xRandomInt(0, 500) / 200
    balls.push(_ball)
  }
}

export const updateCanvasSize = (tagName: string, globalOptions: any) => {
  let canvas: HTMLCanvasElement | null = getCanvasElementById(tagName)
  const width = canvas.width,
    height = canvas.height
  if (document.body.clientWidth < 760) {
    const sizeWidth = (window.innerWidth * width) / 750
    const sizeHeight = (window.innerWidth * height) / 750
    canvas.width = sizeWidth
    canvas.height = sizeHeight
    canvas.style.width = `${sizeWidth}px`
    canvas.style.height = `${sizeHeight}px`
  }
  switch (tagName) {
    case 'egg-wrapper':
      globalOptions[1] = width
      globalOptions[2] = height
      break
    case 'result-window':
      globalOptions[3] = width
      globalOptions[4] = height
      break
    default:
      break
  }
  canvas = null
}

export const updateCanvasRender = debounce((globalOptions): void => {
  updateCanvasSize('egg-wrapper', globalOptions)
  updateCanvasSize('result-window', globalOptions)
}, 1000)

export const initCanvasSize = (globalOptions: any): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      updateCanvasSize('egg-wrapper', globalOptions)
      updateCanvasSize('result-window', globalOptions)
      resolve(true)
    }, 100)
  })
}

function _formatDeg(rotateDeg: number): string
function _formatDeg(rotateDeg: string): number
function _formatDeg(rotateDeg: number | string) {
  if (typeof rotateDeg === 'string') {
    return parseInt(rotateDeg.split('(')[1].split('deg')[0])
  } else if (typeof rotateDeg === 'number') {
    return `rotate(${rotateDeg}deg)`
  }
}

export const formatDeg = _formatDeg

// 过渡下，有缘回来。
export type Callback = (...args: number[]) => void

// removeAll 暴露事件移除的钩子，有时间优化
export class LongTap {
  element: HTMLElement
  startEvent: string
  moveEvent: string
  endEvent: string
  timer: number | null
  private static instance: LongTap
  private constructor(element: HTMLElement) {
    this.element = element
    this.timer = null
    this.startEvent = 'touchstart'
    this.moveEvent = 'touchmove'
    this.endEvent = 'touchend'
    this.eventJudge()
  }
  public static getInstance(element: HTMLElement) {
    if (!LongTap.instance) {
      LongTap.instance = new LongTap(element)
    }
    return LongTap.instance
  }
  longTap(callback1: Callback, callback2: Callback) {
    this.element.addEventListener(
      this.startEvent,
      () => this.touchStart(callback1),
      false
    )
    this.element.addEventListener(this.moveEvent, this.touchMove, false)
    this.element.addEventListener(
      this.endEvent,
      () => this.touchEnd(callback2),
      false
    )
  }
  touchStart(callback: Callback) {
    const cb = (...args: number[]) =>
      typeof callback === 'function' && callback(...args)
    this.timer = setTimeout(() => {
      cb()
    }, 500) // 超过 300ms 视为长按
  }
  touchMove() {
    this.timer && clearTimeout(this.timer)
  }
  touchEnd(callback: Callback) {
    callback()
    this.timer && clearTimeout(this.timer)
  }

  // 判断是移动端还是PC端
  eventJudge() {
    const click = ['mousedown', 'mouseout', 'mouseup']
    const touch = ['touchstart', 'touchmove', 'touchend']
    const touchSupport = 'ontouchstart' in window
    ;[this.startEvent, this.moveEvent, this.endEvent] = touchSupport
      ? touch
      : click
  }
}

export interface SwitchObj {
  tagName: string
  rotateId: number | null
  callback: Callback
  // counterClockwiseSpeed 多少倍慢速，有时间优化
}

const formatDegToNumber = (switchObj: HTMLElement | null): number => {
  const degStr: string =
    (switchObj && switchObj.style.transform) || 'rotate(0deg)'
  return formatDeg(degStr)
}

// 逆时针恢复
export const restoreSwitch = ({ tagName, rotateId, callback }: SwitchObj) => {
  let markObj: HTMLElement | null = getHTMLElement('.mark')
  markObj.style.display = 'block'
  let switchObj: HTMLElement | null = getHTMLElement(tagName)
  function rotate() {
    let deg: number = formatDegToNumber(switchObj)
    // 控制速度
    deg--
    switchObj && (switchObj.style.transform = formatDeg(deg))
    rotateId = requestAnimationFrame(rotate)
    // 逆时针
    if (deg <= 0) {
      switchObj && (switchObj.style.transform = 'rotate(0deg)')
      cancelAnimationFrame(rotateId)
      callback()
      markObj && (markObj.style.display = 'none')
      // 回收内存
      markObj = switchObj = rotateId = null
    }
  }
  rotate()
}
// 顺时针
export const rotateSwitchObserver = ({
  tagName,
  rotateId,
  callback
}: SwitchObj) => {
  const switchObj: HTMLElement | null = getHTMLElement(tagName)
  function rotate() {
    let deg: number = formatDegToNumber(switchObj)
    // 控制速度
    deg++
    switchObj && (switchObj.style.transform = formatDeg(deg))
    rotateId = requestAnimationFrame(rotate)
    // 顺时针暂时先一圈吧，有时间优化
    if (deg >= 359) cancelAnimationFrame(rotateId)
  }
  const app = LongTap.getInstance(switchObj)
  app.longTap(
    () => {
      rotate()
    },
    () => {
      rotateId && cancelAnimationFrame(rotateId)
      // 回收内存
      rotateId = null
      // 逆时针恢复
      const deg: number = formatDegToNumber(switchObj)
      if (deg > 0) restoreSwitch({ tagName, rotateId, callback })
    }
  )
}

export const bouncingAnim = (bounceId: number) => {
  const canvas: HTMLCanvasElement = getCanvasElementById('result-window'),
    ctx: CanvasRenderingContext2D = getCanvasRenderingContext2D(canvas)

  const img = new Image()
  const W = canvas.width,
    H = canvas.height,
    gravity = 0.2, // 重力
    bounceFactor = 0.7, // 弹力
    ball = {
      x: W / 2,
      y: 0 - H,
      radius: 44,
      vx: 0,
      vy: 1,
      draw: drawCircle
    }
  img.onload = function() {
    function update() {
      ctx.clearRect(0, 0, W, H)
      ctx.save()
      ball.draw(ctx, ball.x, ball.y, ball.radius, 'rgba(0,0,0,0)')
      // 偷懒的方式：剪切后填充图片，由于是单个小球图片，没有碰撞。
      ctx.clip()
      ctx.drawImage(
        img,
        ball.x - ball.radius,
        ball.y - ball.radius,
        ball.radius * 2,
        ball.radius * 2
      )
      ball.y += ball.vy
      ball.vy += gravity
      if (ball.y + ball.radius >= H) {
        ball.y = H - ball.radius
        ball.vy *= -bounceFactor
        if (ball.vy >= -1) {
          ball.vy = 0
        }
      }
      ctx.restore()
      bounceId = requestAnimationFrame(update)
      if (ball.vy === 0) cancelAnimationFrame(bounceId)
    }
    update()
  }
  img.src = require(`@/assets/egg-1.png`)
}

export const eggLoadedBouncingAnim = (
  event: Event,
  tagName: string,
  bounceId: number,
  radius: number
) => {
  const canvas: HTMLCanvasElement = getCanvasElementById(tagName),
    ctx: CanvasRenderingContext2D = getCanvasRenderingContext2D(canvas)
  const img = event.target as CanvasImageSource
  const W = canvas.width,
    H = canvas.height,
    gravity = 0.2, // 重力
    bounceFactor = 0.7, // 弹力
    ball = {
      x: W / 2,
      y: 0 - H,
      radius: radius,
      vx: 0,
      vy: 1,
      draw: drawCircle
    }
  function update() {
    ctx.clearRect(0, 0, W, H)
    ball.draw(ctx, ball.x, ball.y, radius, 'rgba(0,0,0,0)')
    img &&
      ctx.drawImage(
        img,
        ball.x - radius,
        ball.y - radius,
        radius * 2,
        radius * 2
      )
    ball.y += ball.vy
    ball.vy += gravity
    if (ball.y + radius >= H) {
      ball.y = H - radius
      ball.vy *= -bounceFactor
      if (ball.vy >= -1) {
        ball.vy = 0
      }
    }
    bounceId = requestAnimationFrame(update)
    if (ball.vy === 0) cancelAnimationFrame(bounceId)
  }
  update()
}

export const exchangeVelocity = (ball: Ball, anotherBall: Ball) => {
  const c1VelocityX = ball.vx
  const c1VelocityY = ball.vy
  const c2VelocityX = anotherBall.vx
  const c2VelocityY = anotherBall.vy
  ball.vx = c2VelocityX
  ball.vy = c2VelocityY
  anotherBall.vx = c1VelocityX
  anotherBall.vy = c1VelocityY
}

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
