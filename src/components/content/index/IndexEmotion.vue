<!-- 

  @author - Mr Dk.
  @version - 2019/12/20

  @description - 
    The index component for displaying emotions

-->

<template>
  <div :class="theme" v-loading="this.loading">

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
</template>

<script>
import CryptoJS from "crypto-js";

export default {
  props: ["theme"],
  data: function () {
    return {

      fail: true,
      failReason: "",
      loading: true,

      emotions: [],
      current: 0,
      date: "",
      emotionText: []

    };
  },

  methods: {

    getEmotions: function () {
      const repoUrl = this.$store.state.githubapi.emotion.url;
      const emotionFilter = this.$store.state.githubapi.emotion.file_filter;
      this.loading = true;
      this.emotions = [];
      this.$http.get(repoUrl).then(response => {

        for (let i = 0; i < response.data.length; i++) {
          if (emotionFilter.test(response.data[i].name)) {
            let { name, url } = response.data[i];
            this.emotions.push({
              date: name,
              url
            });
          }
        }

        this.emotions.reverse();
        this.getEmotionContent(0);

        this.fail = false;
        // this.loading = false;

      }).catch(error => {
        this.fail = true;
        this.failReason = error.message;
        this.loading = false;
      })
    },

    getEmotionContent: function (index) {
      this.loading = true;
      this.emotionText = [];
      this.$http.get(this.emotions[index].url).then(response => {
        if (response.data.encoding === "base64") {
          const key = CryptoJS.enc.Utf8.parse("zhangjt199700000");
          let base64 = decodeURIComponent(escape(window.atob(response.data.content)));
          let encodedPlain = CryptoJS.AES.decrypt(base64, key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
          });
          let plain = encodedPlain.toString(CryptoJS.enc.Utf8);
          
          this.emotionText = plain.split("\n");
          this.date = this.emotions[index].date;

        } else {
          // Encoding not support
          this.emotionText.push("Encoding not support.");
        }

        this.fail = false;
        this.loading = false;

      }).catch(error => {
        this.fail = true;
        this.failReason = error.message;
        this.loading = false;
      })
    },

    preEmotion: function () {
      if (!(this.current === this.emotions.length - 1)) {
        this.current++;
        this.getEmotionContent(this.current);
      }
    },

    nextEmotion: function () {
      if (!(this.current === 0)) {
        this.current--;
        this.getEmotionContent(this.current);
      }
    },

    emotionLinkText: function (previous) {
      if (previous) {
        let str = "Previous Emotion: ";
        if (this.current != this.emotions.length - 1) {
          return str + "📅 " + this.emotions[this.current + 1].date;
        } else {
          // No more previous emotion
          return str + "😅 no more";
        }
      } else {
        let str = "Next Emotion: ";
        if (this.current != 0) {
          return str + "📅 " + this.emotions[this.current - 1].date;
        } else {
          // No more next emotion
          return str + "😅 no more";
        }
      }
    }
    
  },

  created: function () {
    this.getEmotions();
  }

}
</script>

