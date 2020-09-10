<!-- 

  @author - Mr Dk.
  @version - 2020/09/10

  @description - 
    The index component for displaying emotions

-->

<template>
  <div :class="theme">

    <el-row
      type="flex">

      <!-- Social icon -->
      <el-col :span="3">
        <div style="height: 100%; float: right; margin-right: 20px">
          <el-image
            style="width: 32px; height: 32px; vertical-align:middle;"
            :src="theme === 'dark' ? tgchannel.icon_dark : tgchannel.icon_light"
            fit="fit">
          </el-image>
          <span
            style="display: inline-block; height: 100%; vertical-align: middle;">
          </span>
        </div>
      </el-col>

      <!-- Social link URL -->
      <el-col :span="16">
        <p>
          {{ tgchannel.name }} -
          <el-link
            type="primary"
            :href="tgchannel.link">
            @{{ tgchannel.login }}
          </el-link>
        </p>
      </el-col>

    </el-row>

    <el-divider></el-divider>

    <div
      v-if="!this.loading"
      v-loading="this.loadingInside">

      <el-timeline
        v-if="!fail">
        
        <el-timeline-item
          :key="0"
          placement="top"
          type="info">

          <el-link
            v-if="!fail"
            :type="(this.current === this.emotions.length - 1) ? 'info' : 'primary'"
            @click="preEmotion">
            {{ this.emotionLinkText(true) }}
          </el-link>
        </el-timeline-item>

        <el-timeline-item
          :key="1"
          placement="top"
          size="large"
          type="primary">

          <h1 style="font-size: 28px;"> {{ "💭 " + this.date }} </h1>
          <p style="font-size: 18px;" v-for="(line, index) in emotionText" :key="index">
            {{ line }} <br/>
          </p>

        </el-timeline-item>

        <el-timeline-item
          :key="2"
          placement="top"
          type="info">

          <el-link
            v-if="!fail"
            :type="(this.current === 0) ? 'info' : 'primary'"
            @click="nextEmotion">
            {{ this.emotionLinkText(false) }}
          </el-link>
        </el-timeline-item>

      </el-timeline>

      <el-alert
        v-if="fail"
        title="Loading failed"
        type="error"
        :description="failReason"
        :closable="false"
        show-icon>
      </el-alert>

    </div>

  </div>
</template>

<script>
import CryptoJS from "crypto-js";

export default {
  props: ["theme", "emotionsDate", "loading"],
  data: function() {
    return {

      fail: true,
      failReason: "",
      loadingInside: true,

      emotions: [],
      current: 0,
      date: "",
      emotionText: [],

      tgchannel: {
        icon_light: "icon/telegram-light.svg",
        icon_dark: "icon/telegram-dark.svg",
        name: "Subscribe my Telegram channel",
        link: "https://t.me/mrdrivingduck_trumpet",
        login: "Mr Dk.'s Trumpet"
      }

    };
  },

  methods: {

    getEmotion: function() {
      const fileFilter = this.$store.state.githubapi.query["emotions"].fileFilter;
      for (let i = 0; i < this.emotionsDate.length; i++) {
        if (fileFilter.test(this.emotionsDate[i].name)) {
          this.emotions.push(this.emotionsDate[i]);
        }
      }
      if (this.emotions.length > 0) {
        this.emotions.reverse();
        this.getEmotionContent(0);
      }
    },

    getEmotionContent: function(index) {
      this.loadingInside = true;
      this.fail = false;
      this.emotionText = [];

      const url = this.$store.state.githubapi.apiv4;
      const tokenPart1 = process.env.VUE_APP_TOKEN_PART_1;
      const tokenPart2 = process.env.VUE_APP_TOKEN_PART_2;
      const emotionDecrypt = process.env.VUE_APP_EMOTION_DECRYPT;
      const token = tokenPart1.concat(tokenPart2);
      let query = this.$store.state.githubapi.query["emotions"].query;
      query = query.replace(/<date>/, this.emotions[index].name);

      this.$http.post(url, { query }, {
        headers: {
          "Authorization": "bearer " + token
        }
      }).then(response => {
        let cipher = response.data.data.emotions.object.text;
        const key = CryptoJS.enc.Utf8.parse(emotionDecrypt);
        let encodedPlain = CryptoJS.AES.decrypt(cipher, key, {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7
        });
        let plain = encodedPlain.toString(CryptoJS.enc.Utf8);
        
        this.emotionText = plain.split("\n");
        this.date = this.emotions[index].name;

        this.loadingInside = false;

      }).catch(error => {
        // HTTP failed
        this.fail = true;
        this.failReason = error.message;
      });
    },

    preEmotion: function() {
      if (!(this.current === this.emotions.length - 1)) {
        this.current++;
        this.getEmotionContent(this.current);
      }
    },

    nextEmotion: function() {
      if (!(this.current === 0)) {
        this.current--;
        this.getEmotionContent(this.current);
      }
    },

    emotionLinkText: function (previous) {
      if (previous) {
        let str = "Previous Emotion: ";
        if (this.current != this.emotions.length - 1) {
          return str + "📅 " + this.emotions[this.current + 1].name;
        } else {
          // No more previous emotion
          return str + "😅 no more";
        }
      } else {
        let str = "Next Emotion: ";
        if (this.current != 0) {
          return str + "📅 " + this.emotions[this.current - 1].name;
        } else {
          // No more next emotion
          return str + "😅 no more";
        }
      }
    }
    
  },
  
  created: function() {
    this.getEmotion();
  }

}
</script>

