import Vue from 'vue'
import App from './App.vue'
import axios from '@/utils/axios'
import router from '@/router'
import 'amfe-flexible/index.js'
import { Button, Form, Field, NumberKeyboard, NavBar, Uploader } from 'vant';

Vue.config.productionTip = false
Vue.use(Button);
Vue.use(Form);
Vue.use(Field);
Vue.use(NumberKeyboard);
Vue.use(NavBar);
Vue.use(Uploader);

Vue.prototype.$axios = axios;

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

