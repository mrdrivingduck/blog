<!-- 

  @author - Mr Dk.
  @version - 2021/08/08

  @description - 
    The content component for displaying issue timeline.

-->

<template>
  <div :class="markdownClass">

    <el-card
        class="basicinfo"
        shadow="hover"
        v-bind:style="{
          backgroundColor: cardBackgroundColor,
          color: cardTextColor }"
        >

        <p>
          ⏰ Last update: <b> {{ issue.updatedAt }} </b>
        </p>
        <p>
          🔗
          <el-link type="primary" :href="issue.url">
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
          <link-clipboard
            :url="issue.copyLink"
            hint="Copy the link to the clipboard"
          ></link-clipboard>
        </p>

        <el-divider></el-divider>
        
        <el-tag
          effect="dark"
          v-for="tag in issue.labels.nodes"
          :key="tag.color"
          :color="'#' + tag.color"> {{ tag.name }} </el-tag>

      </el-card>

    <!-- Content -->
    <div
      v-if="!fail"
      v-loading="loading">

      <h1> {{ issue.title }} </h1>

        <div>
          <el-timeline ref="markdown">
            <el-timeline-item
              v-for="comment in issue.comments.nodes"
              :key="comment.databaseId"
              placement="top">
              <el-card
                class="basicinfo" shadow="hover"
                v-bind:style="{
                  backgroundColor: cardBackgroundColor,
                  color: cardTextColor
                }">

                <div v-html="comment.bodyHTML"/>

              </el-card>
            </el-timeline-item>
          </el-timeline>
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

<style src="duckling-markdown-css/github-markdown.css"></style>
<style src="duckling-markdown-css/github-markdown-dark.css"></style>

<script>
// import GithubButton from "vue-github-button";
import LinkClipboard from '../util/LinkClipboard';

export default {
  name: "ContentIssueTimeline",
  components: {
    // GithubButton,
    LinkClipboard
  },
  props: [ "theme" ],
  data() {
    return  {
      loading: true, // For displaying loading status
      fail: false, // Set to true if loading error occurs
      failReason: "", // Reason of failure

      // Theme of the card
      cardBackgroundColor: null,
      cardTextColor: null,

      issue: {
        labels: {
          nodes: []
        },
        comments: {
          nodes: []
        },
        copyLink: ""
      },

      markdownClass: null,

      repo: "",
      number: 0
    };
  },
  methods: {

    // Set the background color and text color of the cards
    setCardStype() {
      const themeIndex = this.$store.state.theme.currentThemeIndex;
      const allThemes = this.$store.state.theme.themes;
      let { backgroundColor, textColor } = allThemes[themeIndex].card;
      this.cardBackgroundColor = backgroundColor;
      this.cardTextColor = textColor;
      this.buttonTheme = allThemes[themeIndex].buttonStyle;
    },

    // Set the corresponding markdown theme
    setMarkdownStyle() {
      const allThemes = this.$store.state.theme.themes;
      const currentTheme = this.$store.state.theme.currentThemeIndex;
      this.markdownClass = allThemes[currentTheme].content.markdown;
    },

    // Called when the theme changes
    onChangeTheme() {
      this.setMarkdownStyle();
      this.setCardStype();
    },

    loadIssue(url, repo, number) {
      const api = this.$store.state.githubapi.query
      const baseUrl = this.$store.state.githubapi.baseUrl
      const tokenPart1 = process.env.VUE_APP_GITHUB_API_TOKEN_PART_1
      const tokenPart2 = process.env.VUE_APP_GITHUB_API_TOKEN_PART_2
      const token = tokenPart1.concat(tokenPart2)

      let query = api.issue
      query = query.replace(/<number>/g, number);

      this.$http.post(url, { query }, {
        headers: {
          "Authorization": "bearer " + token
        }
      }).then(response => {
        
        this.issue = response.data.data["paper_outline"]["issue"]
        this.issue.comments.nodes.splice(0, 0, { 
          bodyHTML: this.issue.bodyHTML,
          updatedAt: this.issue.updatedAt,
          databaseId: this.issue.databaseId
        })
        this.issue["copyLink"] = baseUrl + "/#/issuetimeline?" +
                                  "repo=" + repo +
                                  "&number=" + number

        // Loading completed.
        this.loading = false

        this.$nextTick(this.onChangeTheme)

      }).catch(error => {
        // HTTP failed
        this.fail = true
        this.failReason = error.message
      })

    }

  },
  created() {
    // Initializing the data from GitHub
    const url = this.$store.state.githubapi.apiv4
    this.repo = this.$route.query.repo
    this.number = this.$route.query.number
    this.loadIssue(url, this.repo, this.number)
  },
  computed: {

    // Listening for the theme changed
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
      this.created()
    }

  }
}
</script>

