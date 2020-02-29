<!-- 

  @author - Mr Dk.
  @version - 2020/02/29

  @description - 
    The index component for displaying emotions

-->

<template>
  <div
    :class="theme"
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
      emotionText: []

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

      let url = this.$store.state.githubapi.apiv4;
      let token = this.$store.state.githubapi.pat;
      let query = this.$store.state.githubapi.query["emotions"].query;
      query = query.replace(/<date>/, this.emotions[index].name);

      this.$http.post(url, { query }, {
        headers: {
          "Authorization": "bearer " + token
        }
      }).then(response => {
        let cipher = response.data.data.emotions.object.text;
        const key = CryptoJS.enc.Utf8.parse("zha" + "ngj" + "t199" + "700000");
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

      // this.$http.get(this.emotions[index].url).then(response => {
      //   if (response.data.encoding === "base64") {
      //     const key = CryptoJS.enc.Utf8.parse("zha" + "ngj" + "t199" + "700000");
      //     let base64 = decodeURIComponent(escape(window.atob(response.data.content)));
      //     let encodedPlain = CryptoJS.AES.decrypt(base64, key, {
      //       mode: CryptoJS.mode.ECB,
      //       padding: CryptoJS.pad.Pkcs7
      //     });
      //     let plain = encodedPlain.toString(CryptoJS.enc.Utf8);
          
      //     this.emotionText = plain.split("\n");
      //     this.date = this.emotions[index].date;

      //   } else {
      //     // Encoding not support
      //     this.emotionText.push("Encoding not support.");
      //   }

      //   this.fail = false;
      //   this.loading = false;

      // }).catch(error => {
      //   this.fail = true;
      //   this.failReason = error.message;
      //   this.loading = false;
      // })
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

