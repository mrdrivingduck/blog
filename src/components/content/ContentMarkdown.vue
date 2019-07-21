<!-- 

  @author - Mr Dk.
  @version - 2019/07/21

  @description - 
    The content component for displaying markdown files

-->

<template>
  <div>

    <el-card
      v-if="!fail"
      v-loading="loading"
      class="basicinfo"
      shadow="hover"
      v-bind:style="{ backgroundColor: cardBackgroundColor, color: cardTextColor }">

      <div>
        <p>
          <i class="el-icon-lock"></i>
          Original link: <b> {{ this.articleLink }} </b>
        </p>
        <p>
          <i class="el-icon-lock"></i>
          sha: <b> {{ this.articleSha }} </b>
        </p>
        <p>
          <i class="el-icon-odometer"></i>
          size: <b> {{ this.articleSize }} </b> Bytes
        </p>
      </div>

    </el-card>

    <!-- Display markdown -->
    <!-- Code highlighting supported -->
    <div
      v-bind:class="this.markdownClass"
      ref="markdown"
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

<style>
  .basicinfo {
    margin-bottom: 50px;
  }
</style>


<script>
import marked from "marked";
import hljs from "duckling-highlight";

export default {
  name: "ContentMarkdown",
  data: function () {
    return  {
      cardBackgroundColor: "",
      cardTextColor: "",
      articleLink: "",
      articleSha: "",
      articleSize: "",

      htmlStr: "", // For displaying markdown content
      loading: true, // For displaying loading status
      fail: false, // Set to true if loading error occurs
      failReason: "", // Reason of failure
      markdownClass: null
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
          this.$nextTick(this.onChangeTheme);

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

    setCodeStyle: function () {
      // Highlight the code into corresponding theme
      const allThemes = this.$store.state.theme.themes;
      const currentTheme = this.$store.state.theme.currentThemeIndex;
      let blocks = this.$refs.markdown.querySelectorAll('pre code');
      blocks.forEach((block) => {
        hljs.highlightBlock(block, allThemes[currentTheme].content.highlight);
      })
    },

    setMarkdownStyle: function () {
      // Set the corresponding markdown theme
      const allThemes = this.$store.state.theme.themes;
      const currentTheme = this.$store.state.theme.currentThemeIndex;
      this.markdownClass = allThemes[currentTheme].markdown.class;
    },

    onChangeTheme: function () {
      // Called when the theme changes
      this.setCodeStyle();
      this.setMarkdownStyle();
    }

  },
  created: function () {
    // Initialize the content from GitHub
    this.initialize();
  },
  computed: {

    markdownUrlChanged: function () {
      // Triggered when markdown resource URL changes
      return this.$store.state.markdown.markdown_url;
    },

    themeChange: function () {
      // Triggered when the theme changes
      return this.$store.state.theme.currentThemeIndex;
    }

  },
  watch: {

    markdownUrlChanged: function () {
      // When URL changes, re-initialize to component
      this.initialize();
    },

    themeChange: function () {
      // When theme changes, reset the style
      this.$nextTick(this.onChangeTheme);
    }
  }
}
</script>