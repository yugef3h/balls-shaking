<template>
  <div class="lottery">
    <header>
      <div class="page-title">
        <div class="rule-entry-wrapper"></div>
      </div>
    </header>
    <main>
      <div class="main-wrapper">
        <div class="title">第 21 期 12 月 18 日直播开奖</div>
        <canvas
          id="egg-wrapper"
          :width="globalOptions[1]"
          :height="globalOptions[2]"
        ></canvas>
        <canvas
          id="result-window"
          :width="globalOptions[3]"
          :height="globalOptions[4]"
        ></canvas>
        <div class="switch"></div>
        <div class="mark"></div>
      </div>
    </main>
    <footer>
      <article>
        <div class="panel-wrapper-header"></div>
        <div class="panel-wrapper-content"></div>
        <div class="panel-wrapper-footer"></div>
      </article>
    </footer>
    <img
      :class="`egg ${index}`"
      v-for="(item, index) in imgData"
      :key="item"
      :src="item"
      :alt="index"
      @load="handleLoad($event, bounceId, index)"
    />
  </div>
</template>

<script lang="ts">
/** @type {HTMLCanvasElement} */
import {
  defineComponent,
  onMounted,
  onBeforeUnmount,
  ref,
  reactive,
  watchEffect,
  watch
} from 'vue'
import { debounce } from 'lodash'
import {
  getCanvasElementById,
  getCanvasRenderingContext2D,
  Ball,
  requestAnimationFrame,
  dist,
  BallObject,
  updateCanvasRender,
  rotateSwitchObserver,
  eggLoadedBouncingAnim,
  exchangeRelativeVelocity,
  createBalls,
  getImgList,
  initCanvasSize,
  userSelectDisable,
  stopAnim,
  ballRender,
  initCanvasBalls
} from '@/config/utils.ts'
import { egg1, egg2, egg3, egg4 } from '@/config/imgData'
import { handleTryCatch } from '@/config/error'
export default defineComponent({
  setup() {
    /**
     * arr[0] 小球半径
     * arr[1] canvas#egg-wrapper 画布宽
     * arr[2] canvas#egg-wrapper 画布高
     * arr[3] canvas#result-window 画布宽
     * arr[4] canvas#result-window 画布高
     */
    const globalOptions = reactive<number[]>([25, 500, 320, 190, 110]),
      /**
       * 参数说明：
       * 因为 canvas 的空间有限，假若 ballCount 和 ballRadius 数值都很大
       * 依旧可能出现粘连和陷入墙里 （边界）的情况，所以 shakingOptions 参数请好好权衡。
       * ballCount 球的数量很大时，ballRadius 半径适当缩小
       * 当然假如 type = 1 非碰撞模式时，影响可以忽略
       */
      shakingOptions = reactive({
        ballCount: 15,
        ballRadius: globalOptions[0],
        type: 2,
        speed: 4,
        tagName: 'egg-wrapper'
      }),
      imgData = reactive({
        egg1,
        egg2,
        egg3,
        egg4,
        winEgg: null
      }),
      // 定时器组
      shakeId = ref<number>(0),
      bounceId = ref<number>(0),
      rotateId = ref<number>(0),
      // egg 画布及 result 画布资源
      o: {
        canvas: HTMLCanvasElement | null
        ctx: CanvasRenderingContext2D | null
        result: HTMLCanvasElement | null
        context: CanvasRenderingContext2D | null
      } = reactive({
        canvas: null,
        ctx: null,
        result: null,
        context: null
      })
    // 小球资源
    let balls = reactive<Ball[]>([])
    // 控制结果：这里暂时控制小球的颜色
    const luckyObj = reactive({
      bgIndex: imgData['egg1']
      // 其他参数可以用接口获取中奖编号，奖品，日期，小球颜色等
    })
    // 摇摇乐 canvas main 主函数
    function shakingAnim({
      type = 'default',
      speed = 4,
      ballRadius = 44,
      ballCount
    }: BallObject) {
      if (o.canvas === null) o.canvas = getCanvasElementById('egg-wrapper')
      if (o.ctx === null) o.ctx = getCanvasRenderingContext2D(o.canvas)

      if (speed <= 4) speed = 4
      const ballColor = 'rgba(0,0,0,0)',
        cvw = o.canvas.width,
        cvh = o.canvas.height,
        _collideBool = type === 'collide' || type === 2,
        nodeList = getImgList(imgData)
      // 创建并过滤位置有误的小球，比如两个黏在一起的，属于碰撞模式优化...
      // 有时间优化：可配置具体颜色的个数
      balls = []
      createBalls({
        balls,
        ballCount,
        ballRadius,
        ballColor,
        cvw,
        cvh,
        speed,
        _collideBool,
        nodeList
      })
      function loop() {
        o.ctx && o.ctx.clearRect(0, 0, cvw, cvh)
        for (let i = 0; i < balls.length; i++) {
          const ball = balls[i],
            radius = ball.radius

          if (_collideBool) {
            for (let j = i + 1; j < balls.length; j++) {
              const anotherBall = balls[j]
              const distance = dist(ball, anotherBall)
              // 碰撞后
              if (distance <= radius + anotherBall.radius) {
                // 1. 相对速度与法线的点积
                exchangeRelativeVelocity(ball, anotherBall, distance)
                // 2. 直接交换速度，没有上面的严谨，总之两种都是有缺陷的。
                // exchangeVelocity(ball, anotherBall)
              }
            }
          }
          // 这里有时间优化，假如有重叠的话可以不绘制，反正你看不出来...
          // 另外：例如 stroke()、fill、drawImage 等 API 尽量不要分次绘制。

          o.ctx && ballRender({ ctx: o.ctx, cvw, cvh, ball, nodeList })
        }
        shakeId.value = requestAnimationFrame(loop)
      }
      loop()
      // or
      // const fps = 50
      // animTimer.value = setInterval(loop, 1000 / fps)
    }

    // 初始化渲染 egg 画布绘制静态的 balls
    function start() {
      initCanvasBalls({ ...shakingOptions, imgData, o, balls })
    }
    // 停止所有动画
    function getResult(id: number) {
      stopAnim(id)
      imgData.winEgg = null
      setTimeout(() => {
        imgData.winEgg = luckyObj.bgIndex
      })
    }
    // 离屏加载资源并进行 result-window 窗口的初始化，传入事件等参数
    function handleLoad(event: Event, bounceId: number, index: string) {
      if (index === 'winEgg') {
        o.result = getCanvasElementById('result-window')
        o.context = getCanvasRenderingContext2D(o.result)
        // result-window
        eggLoadedBouncingAnim({
          event,
          o,
          tagName: 'result-window',
          bounceId,
          radius: globalOptions[0],
          endEvent: start
        })
      }
    }

    const changeCanvasSize = debounce(() => {
      updateCanvasRender(globalOptions)
      if (shakeId.value) stopAnim(shakeId.value)
      if (bounceId.value) stopAnim(bounceId.value)
    }, 1000)

    onMounted(async () => {
      // 禁止移动端的右键菜单
      userSelectDisable()
      // 初始化画布、小球等资源的尺寸
      const [err] = await handleTryCatch(initCanvasSize)(globalOptions)
      if (err) return console.log(err, 'err')
      // 展示小球的静态图
      start()
      // 监听按钮
      rotateSwitchObserver({
        tagName: '.switch',
        rotateId: rotateId.value,
        startEvent: () => {
          shakingAnim(shakingOptions)
          o.result &&
            o.context?.clearRect(0, 0, o.result?.width, o.result?.height)
        },
        // 归位后回调
        endEvent: () => getResult(shakeId.value)
      })
      window.addEventListener('resize', changeCanvasSize)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', changeCanvasSize)
      o.canvas = o.ctx = null
    })

    watch(
      () => luckyObj.bgIndex,
      val => {
        imgData.winEgg = val
      }
    )
    // 响应式更新 ballRadius
    watchEffect(() => {
      shakingOptions.ballRadius = globalOptions[0]
    })
    return {
      balls,
      imgData,
      luckyObj,
      handleLoad,
      bounceId,
      start,
      globalOptions,
      shakingOptions
    }
  }
})
</script>

<style scoped>
#egg-wrapper {
  position: absolute;
  top: 210px;
  left: 50%;
  transform: translateX(-50%);
}
#result-window {
  position: absolute;
  top: 700px;
  left: 112px;
}
</style>
<style>
:root {
  --maxw: 750px;
  --minw: 320px;
}
.lottery {
  width: 100%;
  min-width: var(--minw);
  color: #fff;
  height: 100vh;
  margin: 0 auto;
  overflow-y: auto;
  -webkit-touch-callout: none; /*系统默认菜单被禁用*/
  -webkit-user-select: none; /*webkit浏览器*/
  -khtml-user-select: none; /*早起浏览器*/
  -moz-user-select: none; /*火狐浏览器*/
  -ms-user-select: none; /*IE浏览器*/
  user-select: none; /*用户是否能够选中文本*/
}
header,
main,
footer {
  display: flex;
  justify-content: center;
  min-width: var(--minw);
}
header {
  margin-top: 45px;
}
main {
  margin-top: 10px;
}
.page-title {
  position: relative;
  width: 100%;
  max-width: var(--maxw);
  height: 220px;
  background-image: url('~@/assets/page-title.png');
  background-repeat: no-repeat;
  background-position: bottom;
  background-size: contain;
}
.rule-entry-wrapper {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 86px;
  height: 86px;
  background-image: url('~@/assets/rule-entry-icon.png');
  cursor: pointer;
  background-repeat: no-repeat;
  background-size: contain;
}
.main-wrapper {
  position: relative;
  width: 100%;
  max-width: var(--maxw);
  height: 882px;
  background-image: url('~@/assets/main-machine.png');
  background-repeat: no-repeat;
  background-position: center 0;
  background-size: 100% auto;
}
.title {
  display: inline-block;
  background-color: rgba(0, 0, 0, 0.2);
  margin-top: 30px;
  font-size: 26px;
  padding: 5px 30px;
  border-radius: 22px;
  font-weight: 300;
}
.switch,
.mark {
  position: absolute;
  right: 209px;
  top: 673px;
  width: 148px;
  height: 148px;
  border-radius: 50%;
}
.mark {
  display: none;
}
.switch {
  background-image: url('~@/assets/switch.png');
  background-repeat: no-repeat;
  background-position: 50%;
  background-size: cover;
  cursor: pointer;
}
article {
  width: 100%;
  max-width: var(--maxw);
}
.panel-wrapper-header {
  width: 100%;
  max-width: var(--maxw);
  height: 190px;
  background-image: url('~@/assets/prize-detail-header-bg.png');
  background-repeat: no-repeat;
  background-position: 50%;
  background-size: 100% auto;
}
.panel-wrapper-content {
  width: 100%;
  max-width: var(--maxw);
  height: 240px;
  background-image: url('~@/assets/discount-content-bg.png');
  background-repeat: repeat-y;
  background-position: 50%;
  background-size: 100% auto;
}
.panel-wrapper-footer {
  width: 100%;
  max-width: var(--maxw);
  height: 40px;
  background-image: url('~@/assets/discount-footer-bg.png');
  background-repeat: no-repeat;
  background-position: 50%;
  background-size: 100% auto;
  margin-bottom: 60px;
}
.panel-wrapper-content,
.panel-wrapper-footer {
  margin-top: -2px;
}
.egg {
  position: fixed;
  width: 0;
  height: 0;
}
</style>
<style scoped>
@media screen and (max-width: 750px) {
  #result-window {
    top: calc(100vw * 700 / 750);
    left: calc(100vw * 112 / 750);
  }
  .title {
    margin-top: calc(100vw * 28 / 750);
    font-size: 18px;
    padding: 0 12px;
    border-radius: calc(100vw * 22 / 750);
  }
  .page-title {
    width: 100vw;
    height: calc(100vw * 220 / 750);
  }
  main {
    width: 100vw;
    height: calc(100vw * 882 / 750);
  }
  .panel-wrapper-header {
    width: 100vw;
    height: calc(100vw * 190 / 750);
    min-height: 81px;
  }
  .panel-wrapper-content {
    width: 100vw;
    height: calc(100vw * 240 / 750);
    min-height: 102px;
  }
  .panel-wrapper-footer {
    width: 100vw;
    height: calc(100vw * 40 / 750);
    min-height: 17px;
  }
  .switch {
    right: calc(100vw * 209 / 750);
    top: calc(100vw * 673 / 750);
    width: calc(100vw * 148 / 750);
    height: calc(100vw * 148 / 750);
  }
  #egg-wrapper {
    top: calc(100vw * 210 / 750);
  }
  .rule-entry-wrapper {
    width: calc(100vw * 86 / 750);
    height: calc(100vw * 86 / 750);
    right: 15px;
  }
}

@media screen and (max-width: 320px) {
  #egg-wrapper,
  #result-window,
  .title .switch,
  footer {
    display: none;
  }
}
</style>
