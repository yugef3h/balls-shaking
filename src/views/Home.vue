<template>
  <div class="home">
    <van-nav-bar title="自助录入" />
    <!-- <p>
      <router-link to="/login">login</router-link>
    </p>-->
    <!-- <p><router-link to="/hometwo">page two</router-link></p> -->
    <!-- <p>
      <a href="/order">order</a>
    </p>-->
    <van-form @submit="onSubmit">
      <van-field
        v-model="realname"
        required
        name="realname"
        label="姓名"
        placeholder="姓名"
        :rules="[{ required: true, message: '请填写姓名' }]"
      />
      <van-field
        v-model="tel"
        required
        type="tel"
        name="tel"
        label="手机号"
        placeholder="手机号"
        :rules="[{ required: true, message: '请填写手机号' }, { validator, message: '请输入正确内容' }]"
      />
      <van-field
        v-model="sms"
        required
        center
        clearable
        name="sms"
        label="短信验证码"
        placeholder="短信验证码"
        :rules="[{ required: true, message: '请填写短信验证码' }]"
      >
        <template #button>
          <van-button size="small" type="primary" @click="sendSms" native-type="button">发送验证码</van-button>
        </template>
      </van-field>
      <div style="margin: 16px;">
        <van-button
          round
          block
          type="info"
          :loading="loading"
          loading-text="验证中..."
          native-type="submit"
        >身份验证</van-button>
      </div>

      <van-field
        v-model="errMsg"
        rows="2"
        readonly
        autosize
        label="调试信息"
        type="textarea"
        maxlength="999"
        placeholder
        show-word-limit
      />
    </van-form>
  </div>
</template>

<script>
import API from "@/utils/req.js";
import { Notify } from "vant";
export default {
  name: "home",
  data() {
    return {
      realname: "方迎",
      tel: "15000004090",
      idcard: "",
      sms: "",
      show: false,
      loading: false,
      errMsg: ""
    };
  },
  components: {},
  created() {
    this.login();
  },
  mounted() {
    setTimeout(() => {
      let error = localStorage.getItem("error");
      if (error) {
        this.errMsg = error;
      }
    }, 3000);
  },
  methods: {
    login() {
      localStorage.clear();
      API.login({
        username: "admin",
        password: "admin12345"
      }).then(res => {
        if (res.code === 200) {
          localStorage.setItem("token", res.result.token);
        }
      });
    },
    onSubmit(values) {
      this.loading = true;
      API.findPersonnelPage({
        realname: values.realname,
        tel: values.tel
      }).then(res => {
        this.loading = false;
        let list = res.result && res.result.list.map(e => {
          let fingers = e.fingers && JSON.parse(e.fingers)
          return {
            ...e,
            fingers: fingers
          }
        });
        if (list && list.length === 1 && list[0].realname === values.realname && list[0].tel === values.tel) {
          localStorage.setItem("person", JSON.stringify(list[0]));
          this.$router.push({ path: "/bio" });
        } else {
          Notify({
            type: "warning",
            message: "姓名或手机号不匹配！",
            duration: 5000
          });
        }
      });
    },
    validator(val) {
      return /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/.test(
        val
      );
    },
    sendSms() {
      let sms = Math.random()
        .toString()
        .slice(-6);
      this.sms = sms;
    }
  }
};
</script>
<style scoped>
</style>