<template>
  <div class>
    <van-nav-bar title="生物信息管理" left-text="返回" left-arrow @click-left="onClickLeft" />

    <van-form @submit="onSubmit">
      <van-field name="uploader" label="照片上传">
        <template #input>
          <van-uploader
            v-model="uploader"
            multiple
            :max-count="1"
            :before-read="beforeRead"
            :before-delete="beforeDel"
          />
        </template>
      </van-field>
      <van-field
        v-model="finger_1"
        center
        clearable
        name="finger_1"
        :label="`指纹1`"
        placeholder="指纹"
      >
        <template #button>
          <van-button size="small" type="primary" @click="createFinger_1" native-type="button">生成指纹</van-button>
        </template>
      </van-field>
      <van-field
        v-model="finger_2"
        center
        clearable
        name="finger_2"
        :label="`指纹2`"
        placeholder="指纹"
      >
        <template #button>
          <van-button size="small" type="primary" @click="createFinger_2" native-type="button">生成指纹</van-button>
        </template>
      </van-field>
      <van-field
        v-model="finger_3"
        center
        clearable
        name="finger_3"
        :label="`指纹3`"
        placeholder="指纹"
      >
        <template #button>
          <van-button size="small" type="primary" @click="createFinger_3" native-type="button">生成指纹</van-button>
        </template>
      </van-field>
      <div style="margin: 16px;">
        <van-button round block type="info" native-type="submit">提交</van-button>
      </div>
    </van-form>
  </div>
</template>

<script>
import API from "@/utils/req.js";
import { Notify } from "vant";
import { Toast } from "vant";
export default {
  name: "bio",
  data() {
    return {
      uploader: [],
      finger_1: "",
      finger_2: "",
      finger_3: "",
      face: "",
      curPerson: {}
    };
  },
  components: {},
  mounted() {
    let person = localStorage.getItem("person");
    if (person) {
      this.curPerson = JSON.parse(person);
      let fingers = this.curPerson.fingers;
      let face = this.curPerson.face;
      if (face) {
        this.uploader.push({
          url: face
        });
        this.face = face;
      }

      if (fingers && fingers.length) {
        this.finger_1 = fingers[0];
        this.finger_2 = fingers[1] || '';
        this.finger_3 = fingers[2] || '';
      }
    }
  },
  methods: {
    onClickLeft() {
      localStorage.clear();
      this.$router.go(-1);
    },
    onSubmit() {
      // 全为空
      if (this.finger_1 === "" && this.finger_2 === "" && this.finger_3 === "" && this.face === "")
        return Notify({
          type: "warning",
          message: "请先填写信息！",
          duration: 5000
        });
      // 照片没变
      // if (
      //   this.uploader.length &&
      //   this.uploader[0].url === this.curPerson.face || this.face === ""
      // ) {
      //   Toast.success("提交成功");
      //   setTimeout(() => {
      //     this.onClickLeft();
      //   }, 1000);
      //   return;
      // }
      // 静默
      API.updatePersonnelFace({
        face: this.face,
        id: this.curPerson.personnelId
      })
      let fingerArr = this.curPerson.fingers
      fingerArr[0] && fingerArr.splice(0, 1, this.finger_1)
      fingerArr[1] && fingerArr.splice(1, 1, this.finger_2)
      fingerArr[2] && fingerArr.splice(2, 1, this.finger_3)
      API.updatePersonnelFinger({
        id: this.curPerson.personnelId,
        fingerArr: fingerArr,
        realname: this.curPerson.realname,
        tel: this.curPerson.tel,
      }).then(res => {
        if (res.code === 200) {
          Toast.success("提交成功");
          setTimeout(() => {
            this.onClickLeft();
          }, 1000);
        }
      })
    },
    createFinger_1() {
      this.createFinger(1);
    },
    createFinger_2() {
      this.createFinger(2);
    },
    createFinger_3() {
      this.createFinger(3);
    },
    createFinger(boolean) {
      let finger = Math.random()
        .toString()
        .slice(-16);
      let idx = finger.indexOf(".");
      let str = [...finger];
      str.splice(idx, 1);
      str.join("");
      if (boolean === 1) {
        this.finger_1 = str.join("");
      }
      if (boolean === 2) {
        this.finger_2 = str.join("");
      }
      if (boolean === 3) {
        this.finger_3 = str.join("");
      }
    },
    beforeRead(file) {
      if (file.type !== "image/jpeg" && file.type.indexOf("png") === -1)
        return Toast("请上传 jpg/png 格式图片");
      let formData = new FormData();
      formData.append("file", file);
      let config = { headers: { "Content-Type": "multipart/form-data" } };

      this.$axios.post("/upload", formData, config).then(res => {
        if (res.data && res.data.code === 200) {
          this.face = res.data.result;
        } else {
          this.uploader = [];
        }
      });
      return true;
    },
    beforeDel() {
      this.uploader = [];
      this.face = "";
    }
  }
};
</script>

<style lang="scss" type="text/scss" scoped>
</style>