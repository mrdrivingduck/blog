<!-- 

  @author - Mr Dk.
  @version - 2019/07/07

  @description - 
    The content component for displaying markdown files

-->

<template>
  <div>

    <div
      v-if="!fail"
      v-loading="loading"
      v-html="htmlStr">
      {{ htmlStr }}
    </div>

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

<style>

</style>

<script>
import marked from "marked";

export default {
  name: "ContentMarkdown",
  data: function () {
    return  {
      htmlStr: "<p> No markdown available. </p>", // For displaying markdown content
      loading: true, // For displaying loading status
      fail: false, // Set to true if loading error occurs
      failReason: "" // Reason of failure
    };
  },
  methods: {

    initialize: function () {
      // Get markdown URL
      const url = this.$store.state.markdown.markdown_url;
      // Initialize component status
      this.htmlStr = "<p> No markdown available. </p>"
      this.loading = true;
      this.fail = false;
      this.failReason = "";
      // Issur HTTP request
      this.$http.get(url).then(response => {

        if (response.body.encoding === "base64") {
          let md = decodeURIComponent(escape(window.atob(response.body.content)));
          this.htmlStr = marked(md);
        } else {
          this.htmlStr = "<p> Encoding not support </p>"
        }

        this.loading = false;

      }, error => {
        // HTTP failure
        this.fail = true;
        this.failReason = "Status: " + error.status;
      });
    }

  },
  created: function () {
    // Initialize the content from GitHub
    this.initialize();
  },
  computed: {
    markdownUrlChanged: function () {
      return this.$store.state.markdown.markdown_url;
    }
  },
  watch: {
    markdownUrlChanged: function () {
      this.initialize();
    }
  }
}
</script>