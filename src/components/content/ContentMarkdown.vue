<!-- 

  @author - Mr Dk.
  @version - 2020/06/20

  @description - 
    The content component for displaying markdown files

-->

<template>
  <div>

    <div 
      v-if="!fail"
      v-loading="loading">

      <el-card
        class="basicinfo"
        shadow="hover"
        v-bind:style="{ backgroundColor: cardBackgroundColor, color: cardTextColor }">

        <p>
          💾 File size: <b> {{ this.articleSize }} </b> KiB
        </p>
        <p>
          ⏱️ Estimated Reading Time: <b> {{ this.articleReadingTime }} </b> min
        </p>
        <p>
          🧷 Created at: <b> {{ this.firstCreatedAt }} </b> by <b> {{ this.firstCreatedAtBy }} </b>
        </p>
        <p>
          📅 Last Modification: <b> {{ this.lastCommitAt }} </b> by <b> {{ this.lastCommitter }} </b>
        </p>
        <p>
          🔏 SHA: <b> {{ this.articleSha }} </b>
        </p>

        <el-divider></el-divider>

        <p>
          🔗
          <el-link type="primary" :href="this.articleLink">
            Origin link from GitHub
          </el-link>
        </p>
        <p>
          📧
          <el-link
            type="warning"
            href="mailto:mrdrivingduck@gmail.com">
            Tell me if there is something wrong
          </el-link>
        </p>
        <p>
          📌
          <el-link
            type="warning"
            v-clipboard:copy="copyLink"
            v-clipboard:success="onCopySuccess"
            v-clipboard:error="onCopyError">
            Copy the link to the clipboard
          </el-link>
        </p>

      </el-card>

      <!-- Display markdown -->
      <!-- Code highlighting supported -->
      <div
        v-bind:class="this.markdownClass"
        ref="markdown"
        v-html="htmlStr">
        {{ htmlStr }}
      </div>
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
  data: function() {
    return  {
      // Info in the card
      cardBackgroundColor: "",
      cardTextColor: "",
      articleLink: "",
      articleSha: "",
      articleSize: "",
      articleReadingTime: "",

      // Commit info
      lastCommitAt: "",
      lastCommitter: "",
      firstCreatedAt: "",
      firstCreatedAtBy: "",
      
      // loading status of each part
      loadingMarkdownComplete: false,
      loadingCommitComplete: false,

      htmlStr: "", // For displaying markdown content
      loading: true, // For displaying loading status
      fail: false, // Set to true if loading error occurs
      failReason: "", // Reason of failure
      markdownClass: null,

      copyLink: "",
    };
  },
  methods: {

    initialize: function() {
      // Metadata
      this.articleLink = "";
      this.articleSize = NaN;
      this.articleReadingTime = NaN;
      this.lastCommitAt = "";
      this.lastCommitter = "";
      this.firstCreatedAt = "";
      this.firstCreatedAtBy = "";

      // Initialize component status
      this.htmlStr = ""
      this.loading = true;
      this.fail = false;
      this.failReason = "";

      if (this.articleReadingTime === 0) {
        this.articleReadingTime = 1;
      }

      this.copyLink = "https://mrdrivingduck.github.io/blog/#" + this.$route.fullPath;

      // Issur HTTP request
      const repo = this.$route.query.repo;
      const path = this.$route.query.path;
      this.getMarkdown(repo, path);
    },

    // Get the content of markdown file
    getMarkdown: function (repo, path) {

      const api = this.$store.state.githubapi.query;
      const url = this.$store.state.githubapi.apiv4;
      const tokenPart1 = process.env.VUE_APP_TOKEN_PART_1;
      const tokenPart2 = process.env.VUE_APP_TOKEN_PART_2;
      const token = tokenPart1.concat(tokenPart2);

      let query = api.markdown;
      query = query.replace(/<repo>/, repo.replace(/_/g, "-"));
      query = query.replace(/<path>/g, path);

      this.$http.post(url, { query }, {
        headers: {
          "Authorization": "bearer " + token
        }
      }).then(response => {
        let originData = response.data.data.repository;
        let markdown = originData.object.text;

        this.articleLink = "https://github.com/mrdrivingduck/" + repo.replace(/_/g, "-")
                            + "/blob/master/" + path;
        this.articleSize = originData.object.byteSize / 1024;
        // this.articleReadingTime = parseInt(1.4 * parseInt(this.articleSize));
        // 400 words per minute
        this.articleReadingTime = parseInt(markdown.length / 400);
        this.articleSha = originData.object.oid;

        let commits = originData.defaultBranchRef.target.history.nodes;
        this.lastCommitAt = commits[0].committedDate;
        this.lastCommitter = commits[0].author.user.name;
        this.firstCreatedAt = commits[commits.length - 1].committedDate;
        this.firstCreatedAtBy = commits[commits.length - 1].author.user.name;
        
        let html = marked(markdown);
        this.htmlStr = html.replace(api[repo].imgMatcher, api[repo].imgPrefix);
        this.$nextTick(this.onChangeTheme);

        // Loading completed.
        this.loading = false;

      }).catch(error => {
        // HTTP failed
        this.fail = true;
        this.failReason = error.message;
      });

    },

    // Highlight the code into corresponding theme
    setCodeStyle: function() {
      const allThemes = this.$store.state.theme.themes;
      const currentTheme = this.$store.state.theme.currentThemeIndex;
      let blocks = this.$refs.markdown.querySelectorAll('pre code');
      blocks.forEach((block) => {
        hljs.highlightBlock(block, allThemes[currentTheme].content.highlight);
      })
    },

    // Set the corresponding markdown theme
    setMarkdownStyle: function() {
      const allThemes = this.$store.state.theme.themes;
      const currentTheme = this.$store.state.theme.currentThemeIndex;
      this.markdownClass = allThemes[currentTheme].content.markdown;
    },

    // Set the theme of card on the top
    setCardStyle: function() {
      const allThemes = this.$store.state.theme.themes;
      const currentTheme = this.$store.state.theme.currentThemeIndex;
      let { backgroundColor, textColor } = allThemes[currentTheme].card;
      this.cardBackgroundColor = backgroundColor;
      this.cardTextColor = textColor;
    },

    // Called when the theme changes
    onChangeTheme: function() {
      this.setCodeStyle();
      this.setMarkdownStyle();
      this.setCardStyle();
    },

    // For copying links hint (success)
    onCopySuccess: function() {
      this.$notify({
        title: "Copy successfully 😁",
        message: "The link is on your clipboard.",
        type: "success"
      });
    },

    // For copying links hint (failed)
    onCopyError: function() {
      this.$notify({
        title: "Copy failed 😥",
        message: "There might be a BUG.",
        type: "error"
      });
    }

  },
  created: function() {
    // Initialize the content from GitHub
    this.initialize();
  },
  computed: {

    // Triggered when the theme changes
    themeChange: function() {
      return this.$store.state.theme.currentThemeIndex;
    }

  },
  watch: {

    // When theme changes, reset the style
    themeChange: function() {
      this.$nextTick(this.onChangeTheme);
    },

    $route: function() {
      this.initialize();
    }

  }
}
</script>