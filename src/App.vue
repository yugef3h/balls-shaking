<template>
  <img alt="Vue logo" src="./assets/logo.png" v-if="false" />
  <HelloWorld :msg="value" v-if="false" />
  <Lottery />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import Lottery from './components/Lottery.vue'

export default defineComponent({
  components: {
    HelloWorld,
    Lottery
  },
  setup() {
    const value = ref('Welcome to Your Vue.js + TypeScript App')
    return {
      value
    }
  }
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #fff;
  height: 100vh;
  width: 100vw;
  background-color: #f5c671;
  background-image: url('~@/assets/bg-1.png');
  background-size: 100% auto;
  background-repeat: no-repeat;
}
</style>
