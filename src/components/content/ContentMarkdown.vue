<!-- 

  @author - Mr Dk.
  @version - 2020/01/27

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
          🔗 Origin Link from GitHub: 
          <el-link type="primary" :href="this.articleLink"> Link from GitHub </el-link>
        </p>
        <!-- <p>
          <i class="el-icon-lock"></i>
          File SHA: <b> {{ this.articleSha }} </b>
        </p>
        <p>
          <i class="el-icon-odometer"></i>
          File Size: <b> {{ this.articleSize }} </b> KiB
        </p> -->
        <p>
          ⏱️ Estimated Reading Time: <b> {{ this.articleReadingTime }} </b> min
        </p>
      </div>

      <div>
        <!-- <p>
          <i class="el-icon-lock"></i>
          Commit SHA: <b> {{ this.commitSha }} </b>
        </p> -->
        <p>
          📅 Last Modification: <b> {{ this.commitLastModification }} </b> by <b> {{ this.committer }} </b>
        </p>
      </div>

      <el-divider></el-divider>

      <div>
        <p>
          📧 Something wrong? - 
          <el-link
            type="warning"
            href="mailto:mrdrivingduck@gmail.com">
            Tell the author
          </el-link>
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
      // Info in the card
      cardBackgroundColor: "",
      cardTextColor: "",
      articleLink: "",
      articleSha: "",
      articleSize: "",
      articleReadingTime: "",

      // Commit info
      commitLastModification: "",
      commitSha: "",
      committer: "",
      
      // loading status of each part
      loadingMarkdownComplete: false,
      loadingCommitComplete: false,

      htmlStr: "", // For displaying markdown content
      loading: true, // For displaying loading status
      fail: false, // Set to true if loading error occurs
      failReason: "", // Reason of failure
      markdownClass: null
    };
  },
  methods: {

    initialize: function () {
      // Metadata
      this.articleLink = "";
      this.articleSize = NaN;
      this.articleReadingTime = NaN;
      this.commitLastModification = "";
      this.committer = "";

      // Initialize component status
      this.htmlStr = ""
      this.loading = true;
      this.fail = false;
      this.failReason = "";

      if (this.articleReadingTime === 0) {
        this.articleReadingTime = 1;
      }

      // Issur HTTP request
      const repo = this.$route.query.repo;
      const path = this.$route.query.path;
      this.getMarkdown(repo, path);
      this.getCommit(repo, path);
    },

    // Get the content of markdown file
    getMarkdown: function (repo, path) {
      // Get markdown URL
      const apis = this.$store.state.githubapi.api;
      let md_url = apis[repo].content + path;

      this.$http.get(md_url).then(response => {

        this.articleLink = response.data.html_url;
        this.articleSize = response.data.size;
        this.articleReadingTime = parseInt(2 * parseInt(this.articleSize) / 1024);

        if (response.data.encoding === "base64") {
          // Parse encoded Base64 to markdown
          let md = decodeURIComponent(escape(window.atob(response.data.content)));
          // Parse markdown to HTML
          let html = marked(md);
          this.htmlStr = html.replace(apis[repo].img_matcher, apis[repo].img_prefix);
          this.$nextTick(this.onChangeTheme);

        } else {
          // Encoding not support
          this.htmlStr = "<p> Encoding not support </p>";
        }

        // Set loading status
        this.loadingMarkdownComplete = true;
        if (this.loadingCommitComplete) {
          this.loading = false;
        }

      }).catch(error => {
        // HTTP failure
        this.fail = true;
        this.failReason = error.message;
      });
    },

    // Get the commit info of the markdown file
    getCommit: function (repo, path) {
      const apis = this.$store.state.githubapi.api;
      let commit_url = apis[repo].commit;

      this.$http.get(commit_url + encodeURIComponent(path)).then(response => {
        
        // Get the last commit
        let { commit, committer } = response.data[0];
        this.commitLastModification = commit.committer.date;
        this.committer = committer.login;

        // Set loading status
        this.loadingCommitComplete = true;
        if (this.loadingMarkdownComplete) {
          this.loading = false;
        }

      }).catch(error => {
        // HTTP failure
        this.fail = true;
        this.failReason = error.message;
      });
    },

    // Highlight the code into corresponding theme
    setCodeStyle: function () {
      const allThemes = this.$store.state.theme.themes;
      const currentTheme = this.$store.state.theme.currentThemeIndex;
      let blocks = this.$refs.markdown.querySelectorAll('pre code');
      blocks.forEach((block) => {
        hljs.highlightBlock(block, allThemes[currentTheme].content.highlight);
      })
    },

    // Set the corresponding markdown theme
    setMarkdownStyle: function () {
      const allThemes = this.$store.state.theme.themes;
      const currentTheme = this.$store.state.theme.currentThemeIndex;
      this.markdownClass = allThemes[currentTheme].content.markdown;
    },

    // Set the theme of card on the top
    setCardStyle: function () {
      const allThemes = this.$store.state.theme.themes;
      const currentTheme = this.$store.state.theme.currentThemeIndex;
      let { backgroundColor, textColor } = allThemes[currentTheme].card;
      this.cardBackgroundColor = backgroundColor;
      this.cardTextColor = textColor;
    },

    // Called when the theme changes
    onChangeTheme: function () {
      this.setCodeStyle();
      this.setMarkdownStyle();
      this.setCardStyle();
    }

  },
  created: function () {
    // Initialize the content from GitHub
    this.initialize();
  },
  computed: {

    // Triggered when the theme changes
    themeChange: function () {
      return this.$store.state.theme.currentThemeIndex;
    }

  },
  watch: {

    // When theme changes, reset the style
    themeChange: function () {
      this.$nextTick(this.onChangeTheme);
    },

    $route: function() {
      this.initialize();
    }

  }
}
</script>