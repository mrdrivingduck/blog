<!-- 

  @author - Mr Dk.
  @version - 2021/08/08

  @description - 
    The content component for displaying issues.

-->

<template>
  <div>

    <!-- Content -->
    <div
      :class="theme"
      v-if="!fail"
      v-loading="loading">

      <el-row :gutter="24" type="flex" align="middle" justify="center">

        <el-col :span="4">
          <div>
            <github-button
              :href="repoLink"
              :data-color-scheme="buttonTheme"
              data-icon="octicon-star"
              data-size="large" data-show-count="true">
              Star
            </github-button>
          </div>
        </el-col>

        <el-col :span="4">
          <div>
            <github-button
              :href="this.repoLink + '/fork'"
              :data-color-scheme="buttonTheme"
              data-icon="octicon-repo-forked"
              data-size="large" data-show-count="true">
              Fork
            </github-button>
          </div>
        </el-col>

        <el-col :span="4">
          <div>
            <github-button
              :href="this.repoLink + '/subscription'"
              :data-color-scheme="buttonTheme"
              data-icon="octicon-eye"
              data-size="large" data-show-count="true">
              Watch
            </github-button>
          </div>
        </el-col>

        <el-col :span="4">
          <div>
            <github-button
              :href="this.repoLink + '/issues'"
              :data-color-scheme="buttonTheme"
              data-icon="octicon-issue-opened"
              data-size="large" data-show-count="true">
              Issue
            </github-button>
          </div>
        </el-col>

        <el-col :span="4">
          <div>
            <github-button
              href="https://github.com/sponsors/mrdrivingduck"
              :data-color-scheme="buttonTheme"
              data-icon="octicon-heart" data-size="large">
              Sponsor
            </github-button>
          </div>
        </el-col>

      </el-row>

      <el-divider></el-divider>

      <!-- Divide each page -->
      <el-pagination
        :hide-on-single-page="true"
        style="text-align: center;"
        layout="prev, pager, next"
        :page-count="Math.ceil(issues.length / pageSize)"
        :current-page="currentPage"
        @current-change="handleCurrentChange">
      </el-pagination>

      <!-- Every card for issue -->
      <el-card
        v-for="issue in issues.slice((currentPage - 1) * pageSize, currentPage * pageSize)"
        :key="issue.number"
        shadow="hover"
        style="margin-bottom: 15px;"
        :style="{ backgroundColor: cardBackgroundColor, color: cardTextColor }">

        <div slot="header">
          <span>
            <b> 📃 {{ issue.title }} </b>
          </span>
          <el-button
            style="float: right" type="text"
            @click="clickIssue(issue)">
            Detail
          </el-button>
        </div>
        <el-tag
          effect="dark"
          v-for="tag in issue.labels.nodes"
          :key="tag.color"
          :color="'#' + tag.color"> {{ tag.name }} </el-tag>
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
          <link-clipboard
            :url="issue.copyLink"
            hint="Copy the link to the clipboard"
          ></link-clipboard>
        </p>

      </el-card>

      <!-- Divide each page -->
      <el-pagination
        :hide-on-single-page="true"
        style="text-align: center;"
        layout="prev, pager, next"
        :page-count="Math.ceil(issues.length / pageSize)"
        :current-page="currentPage"
        @current-change="handleCurrentChange">
      </el-pagination>

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
import GithubButton from "vue-github-button";
import LinkClipboard from "../util/LinkClipboard"

export default {
  name: "ContentIssues",
  components: {
    GithubButton,
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

      issues: [],

      // For paging
      currentPage: 1,
      pageSize: 6,

      repo: "paper-outline",
      repoLink: "",
      buttonTheme: "no-preference: light; light: dark; dark: light;"
    };
  },
  methods: {

    // Set the background color and text color of the cards
    setCardTheme() {
      const themeIndex = this.$store.state.theme.currentThemeIndex;
      const allThemes = this.$store.state.theme.themes;
      let { backgroundColor, textColor } = allThemes[themeIndex].card;
      this.cardBackgroundColor = backgroundColor;
      this.cardTextColor = textColor;
      this.buttonTheme = allThemes[themeIndex].buttonStyle;
    },

    // For changing the current-page variable
    handleCurrentChange(currentPage) {
      this.currentPage = currentPage;
    },

    loadIssues(url) {
      const api = this.$store.state.githubapi.query
      const baseUrl = this.$store.state.githubapi.baseUrl
      const tokenPart1 = process.env.VUE_APP_GITHUB_API_TOKEN_PART_1
      const tokenPart2 = process.env.VUE_APP_GITHUB_API_TOKEN_PART_2
      const token = tokenPart1.concat(tokenPart2)

      let query = api.issues_meta

      this.$http.post(url, { query }, {
        headers: {
          "Authorization": "bearer " + token
        }
      }).then(response => {
        
        this.issues = response
                      .data
                      .data["paper_outline"]["issues"]["nodes"]

        for (let issue of this.issues) {
          issue["copyLink"] = baseUrl + "/#/issuetimeline?" +
                              "repo=" + this.repo +
                              "&number=" + issue.number
        }

        // Loading completed.
        this.loading = false

      }).catch(error => {
        // HTTP failed
        this.fail = true
        this.failReason = error.message
      })

    },

    clickIssue(issue) {
      this.$router.push({
        path: "/issuetimeline",
        query: {
          repo: this.repo,
          number: issue.number
        }
      }).catch(err => { err });
    },

  },
  created() {
    // Initializing the data from GitHub
    const url = this.$store.state.githubapi.apiv4
    const baseUrl = this.$store.state.githubapi.githubBaseUrl
    this.repoLink = baseUrl + this.repo
    this.loadIssues(url)
    this.setCardTheme()
  },
  computed: {

    // Listening for the theme changed
    themeChange() {
      return this.$store.state.theme.currentThemeIndex;
    }

  },
  watch: {

    // Set the theme of the card
    themeChange() {
      this.setCardTheme();
    },

    $route() {
    }

  }
}
</script>

