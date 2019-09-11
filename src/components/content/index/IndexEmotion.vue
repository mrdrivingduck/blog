<!-- 

  @author - Mr Dk.
  @version - 2019/09/11

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
        type="info"
        v-if="this.current === 0 ? false : true">
        <el-link
          :type="(this.current === 0) ? 'info' : 'primary'"
          @click="nextEmotion">
          Next Emotion
        </el-link>
      </el-timeline-item>

      <el-timeline-item
        :key="1"
        placement="top"
        type="primary">

        <h1 style="font-size: 25px;"> {{ this.date }} </h1>
        <p style="font-size: 18px;" v-for="(line, index) in emotionText" :key="index">
          {{ line }}
        </p>

      </el-timeline-item>

      <el-timeline-item
        :key="2"
        placement="top"
        type="info"
        v-if="(this.current === this.emotions.length - 1) ? false : true">

        <el-link
          :type="(this.current === this.emotions.length - 1) ? 'info' : 'primary'"
          @click="preEmotion">
          Previous Emotion
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
export default {
  props: ["theme"],
  data: function () {
    return {

      fail: false,
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
      const auth = this.$store.state.githubapi.authorization;
      this.loading = true;
      this.emotions = [];
      this.$http.get(repoUrl, {
        headers: {
          "Authorization": auth
        }
      }).then(response => {

        for (let i = 0; i < response.data.length; i++) {
          let { name, url } = response.data[i];
          this.emotions.push({
            date: name,
            url
          });
        }

        this.emotions.reverse();
        this.getEmotionContent(0);

        this.fail = false;
        // this.loading = false;

      }).catch(error => {
        this.fail = true;
        this.failReason = error;
      })
    },

    getEmotionContent: function (index) {
      const auth = this.$store.state.githubapi.authorization;
      this.loading = true;
      this.emotionText = [];
      this.$http.get(this.emotions[index].url, {
        headers: {
          "Authorization": auth
        }
      }).then(response => {

        if (response.data.encoding === "base64") {
          // Parse encoded Base64 to markdown
          let text = decodeURIComponent(escape(window.atob(response.data.content)));
          this.date = this.emotions[index].date;
          this.emotionText = text.split("\n");

        } else {
          // Encoding not support
          this.emotionText.push("Encoding not support.");
        }

        this.fail = false;
        this.loading = false;

      }).catch(error => {
        this.fail = true;
        this.failReason = error;
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
    }

  },

  created: function () {
    this.getEmotions();
  }

}
</script>

