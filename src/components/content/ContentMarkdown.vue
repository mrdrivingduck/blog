<!-- 

  @author - Mr Dk.
  @version - 2019/07/12

  @description - 
    The content component for displaying markdown files

-->

<template>
  <div>

    <!-- Display markdown -->
    <!-- Code highlighting supported -->
    <div
      class="markdown-body"
      ref="highlight"
      v-if="!fail"
      v-loading="loading"
      v-html="htmlStr">
      {{ htmlStr }}
    </div>

    <!-- Load failure -->
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
import marked from "marked";
import hljs from "duckling-highlight";

export default {
  name: "ContentMarkdown",
  data: function () {
    return  {
      htmlStr: "", // For displaying markdown content
      loading: true, // For displaying loading status
      fail: false, // Set to true if loading error occurs
      failReason: "", // Reason of failure,

      theme: "one-light"
    };
  },
  methods: {

    initialize: function () {
      // Get markdown URL
      const url = this.$store.state.markdown.markdown_url;
      // Initialize component status
      this.htmlStr = ""
      this.loading = true;
      this.fail = false;
      this.failReason = "";
      // Issur HTTP request
      this.$http.get(url).then(response => {

        if (response.body.encoding === "base64") {
          // Parse encoded Base64 to markdown
          let md = decodeURIComponent(escape(window.atob(response.body.content)));
          // Parse markdown to HTML
          this.htmlStr = marked(md);
          this.$nextTick(this.highLightCode);

        } else {
          // Encoding not support
          this.htmlStr = "<p> Encoding not support </p>"
        }
        // Set loading status
        this.loading = false;

      }, error => {
        // HTTP failure
        this.fail = true;
        this.failReason = "Status: " + error.status;
      });
    },

    highLightCode: function () {
      let blocks = this.$refs.highlight.querySelectorAll('pre code');
      blocks.forEach((block) => {
        hljs.highlightBlock(block, this.theme)
      })
    }

  },
  created: function () {
    // Initialize the content from GitHub
    this.initialize();
  },
  computed: {
    /**
     * Triggered when markdown resource URL changes
     */
    markdownUrlChanged: function () {
      return this.$store.state.markdown.markdown_url;
    }
  },
  watch: {
    /**
     * When URL changes, re-initialize to component
     */
    markdownUrlChanged: function () {
      this.initialize();
    }
  }
}
</script>