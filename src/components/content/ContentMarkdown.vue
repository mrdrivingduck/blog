<!-- 

  @author - Mr Dk.
  @version - 2021/05/13

  @description - 
    The content component for displaying markdown files

-->

<template>
  <div>

    <div
      :class="theme"
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

        <github-button
          :href="repoLink"
          :data-color-scheme="buttonTheme"
          data-icon="octicon-star"
          data-size="large" data-show-count="true">
          Star
        </github-button>

      </el-card>

      <!-- CSS CDN: https://www.bootcdn.cn/highlight.js/ -->
      <div ref="styles">
        <div v-for="theme in highlightThemeList" :key="theme">
          <link
            rel="stylesheet"
            disabled
            :title="theme"
            :href="'https://cdn.bootcdn.net/ajax/libs/highlight.js/10.6.0/styles/' + theme + '.min.css'">
        </div>
      </div>

      <!-- Display markdown -->
      <!-- Code highlighting supported -->
      <div
        v-bind:class="this.markdownClass"
        ref="markdown"
        v-html="htmlStr">
        <!-- {{ htmlStr }} -->
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

<style src="duckling-markdown-css/github-markdown.css"></style>
<style src="duckling-markdown-css/github-markdown-dark.css"></style>

<script>
// import marked from "marked";
import MarkdownIt from 'markdown-it'
import hljs from "highlight.js";
import GithubButton from "vue-github-button";

export default {
  name: "ContentMarkdown",
  components: { GithubButton },
  props: [ "theme" ],
  data() {
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

      preHighlightThemeIndex: null,
      currentHighlightThemeIndex: null,
      highlightThemeList: [],

      copyLink: "",
      repoLink: "",
      buttonTheme: "no-preference: light; light: dark; dark: light;"
    };
  },
  methods: {

    initialize() {
      // Code highlight theme
      const allThemes = this.$store.state.theme.themes;
      this.highlightThemeList = [];
      for (let i = 0; i < allThemes.length; i++) {
        this.highlightThemeList.push(allThemes[i].content.highlight);
      }
      
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

      this.copyLink = this.$store.state.githubapi.baseUrl + "/#" + this.$route.fullPath;

      // Issur HTTP request
      const repo = this.$route.query.repo;
      const path = this.$route.query.path;
      const apiUrl = this.$store.state.githubapi.apiv4;
      this.getMarkdown(repo, path, apiUrl);
    },

    // Get the content of markdown file
    getMarkdown(repo, path, url) {
      const api = this.$store.state.githubapi.query;
      const tokenPart1 = process.env.VUE_APP_GITHUB_API_TOKEN_PART_1;
      const tokenPart2 = process.env.VUE_APP_GITHUB_API_TOKEN_PART_2;
      const token = tokenPart1.concat(tokenPart2);

      const branch = api[repo].branch;
      let query = api.markdown;
      query = query.replace(/<repo>/g, repo.replace(/_/g, "-"));
      query = query.replace(/<branch>/g, branch);
      query = query.replace(/<path>/g, path);

      this.repoLink = api[repo].link;

      this.$http.post(url, { query }, {
        headers: {
          "Authorization": "bearer " + token
        }
      }).then(response => {
        let originData = response.data.data.repository;
        let markdown = originData.object.text;

        this.articleLink = "https://github.com/mrdrivingduck/" + repo.replace(/_/g, "-")
                            + "/blob/" + branch + "/" + path;
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
        
        // let html = marked(markdown);
        let html = new MarkdownIt().render(markdown)
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
    setCodeStyle() {
      this.$refs.markdown.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
      });

      const allThemes = this.$store.state.theme.themes;
      const currentTheme = allThemes[this.currentHighlightThemeIndex].content.highlight;
      this.$refs.styles.querySelector(`link[title="${currentTheme}"]`).removeAttribute("disabled");

      if (this.preHighlightThemeIndex !== undefined) {
        const preTheme = allThemes[this.preHighlightThemeIndex].content.highlight
        this.$refs.styles.querySelector(`link[title="${preTheme}"]`).setAttribute("disabled", "");
      }
    },

    // Set the corresponding markdown theme
    setMarkdownStyle() {
      const allThemes = this.$store.state.theme.themes;
      const currentTheme = this.$store.state.theme.currentThemeIndex;
      this.markdownClass = allThemes[currentTheme].content.markdown;
    },

    // Set the theme of card on the top
    setCardStyle() {
      const allThemes = this.$store.state.theme.themes;
      const currentTheme = this.$store.state.theme.currentThemeIndex;
      let { backgroundColor, textColor } = allThemes[currentTheme].card;
      this.cardBackgroundColor = backgroundColor;
      this.cardTextColor = textColor;
      this.buttonTheme = allThemes[currentTheme].buttonStyle;
    },

    // Called when the theme changes
    onChangeTheme() {
      this.setCodeStyle();
      this.setMarkdownStyle();
      this.setCardStyle();
    },

    // For copying links hint (success)
    onCopySuccess() {
      this.$notify({
        title: "Copy successfully 😁",
        message: "The link is on your clipboard.",
        type: "success"
      });
    },

    // For copying links hint (failed)
    onCopyError() {
      this.$notify({
        title: "Copy failed 😥",
        message: "There might be a BUG.",
        type: "error"
      });
    }

  },
  created() {
    // Initialize the content from GitHub
    this.initialize();
  },
  computed: {

    // Triggered when the theme changes
    themeChange() {
      return this.$store.state.theme.currentThemeIndex;
    }

  },
  watch: {

    // When theme changes, reset the style
    themeChange: {
      handler(newThemeIndex, oldThemeIndex) {
        this.currentHighlightThemeIndex = newThemeIndex;
        this.preHighlightThemeIndex = oldThemeIndex;
        this.$nextTick(this.onChangeTheme);
      },
      immediate: true
    },

    $route() {
      this.initialize();
    }

  }
}
</script>