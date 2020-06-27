<!-- 

  @author - Mr Dk.
  @version - 2020/06/27

  @description - 
    The index component for displaying page information

-->

<template>
  <div :class="theme">

      <p style="font-size: 30px;"> Page </p>
      <p>
        Developed by: 🦆 <b> Mr Dk. </b>
        <el-link type="primary" href="https://github.com/mrdrivingduck">
          @mrdrivingduck
        </el-link>
      </p>
      <github-button
        href="https://github.com/mrdrivingduck"
        :data-color-scheme="buttonTheme"
        data-size="large" data-show-count="true">
        Follow @mrdrivingduck
      </github-button>

      <p> Blog page build version: <b> {{ blogVersion }} </b> </p>

      <el-row :gutter="24" type="flex" align="middle" justify="start">

        <el-col :span="4">
          <div>
            <github-button
              href="https://github.com/mrdrivingduck/blog"
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
              href="https://github.com/mrdrivingduck/blog/issues"
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

    <div
      v-if="!fail">

      <p style="font-size: 30px;"> Deployment </p>
      <p> 📤 {{ deployment.commitData.message }} </p>
      <p>
        ⌚ Committed at <b>{{ deployment.commitData.committedDate }}</b> by
        <el-link :href="deployment.commitData.committer.user.url" type="primary">
          {{ deployment.commitData.committer.user.name }}
        </el-link>
      </p>
      <p>
        ⌚ Deployed at <b>{{ deployment.commit.committedDate }}</b> by
        <el-link :href="deployment.commit.committer.user.url" type="primary">
          {{ deployment.commit.committer.user.name }}
        </el-link>
      </p>
    </div>

    <el-divider></el-divider>

    <p style="font-size: 30px;"> Supported by </p>
    <p
      v-for="support in supporting"
      :key="support.name">
      <el-link
        :href="support.link"
        type="primary">
        {{ support.name }}
      </el-link>
        - {{ support.description }}
    </p>

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

export default {
  props: [ "theme", "fail", "deployment", "blogVersion" ],
  components: { GithubButton },
  data: function() {
    return {
      buttonTheme: null,

      // deployment: null,

      // Supporting tech.
      supporting: [
        {
          name: "Vue.js",
          description: "🖖 Vue.js is a progressive, incrementally-adoptable JavaScript framework for building UI on the web.",
          link: "https://vuejs.org/"
        },
        {
          name: "Vuex",
          description: "🗃️ Centralized State Management for Vue.js.",
          link: "https://vuex.vuejs.org"
        },
        {
          name: "Vue Router",
          description: "🚦 The official router for Vue.js.",
          link: "https://router.vuejs.org/"
        },
        {
          name: "Vue CLI",
          description: "🛠️ Standard Tooling for Vue.js Development.",
          link: "https://cli.vuejs.org/"
        },
        {
          name: "Vue Clipboard 2",
          description: "A simple Vue 2 binding to clipboard.js.",
          link: "https://github.com/Inndy/vue-clipboard2"
        },
        {
          name: "Axios",
          description: "Promise based HTTP client for the browser and node.js.",
          link: "https://github.com/axios/axios"
        },
        {
          name: "Element",
          description: "A Vue.js 2.0 UI Toolkit for Web.",
          link: "https://element.eleme.io/"
        },
        {
          name: "Marked.js",
          description: "A markdown parser and compiler. Built for speed.",
          link: "https://marked.js.org/"
        },
        {
          name: "GitHub Markdown CSS",
          description: "The minimal amount of CSS to replicate the GitHub Markdown style.",
          link: "https://github.com/mrdrivingduck/github-markdown-css"
        },
        {
          name: "highlight.js",
          description: "JavaScript syntax highlighter.",
          link: "https://github.com/mrdrivingduck/highlight.js"
        },
        {
          name: "CryptoJS",
          description: "JavaScript library of crypto standards.",
          link: "https://github.com/brix/crypto-js"
        },
        {
          name: "GitHub API v4",
          description: "The official GitHub GraphQL API v4.",
          link: "https://developer.github.com/v4/"
        },
        {
          name: "GitHub Pages",
          description: "Websites for you and your projects.",
          link: "https://pages.github.com/"
        },
        {
          name: "Aliyun",
          description: "More Than Just Cloud.",
          link: "https://www.aliyun.com/"
        },
        {
          name: "Travis CI",
          description: "Test and Deploy Your Code with Confidence.",
          link: "https://www.travis-ci.org/"
        },
        {
          name: "GitHub Buttons",
          description: "Unofficial github:button component for Vue.js.",
          link: "https://buttons.github.io/"
        }
      ]
    };
  },
  methods: {

    setTheme: function() {
      const themeIndex = this.$store.state.theme.currentThemeIndex;
      const allThemes = this.$store.state.theme.themes;
      this.buttonTheme = allThemes[themeIndex].buttonStyle;
    }

  },
  created: function() {
    this.setTheme();
  },
  computed: {

    // Listening for the theme changed
    themeChange: function() {
      return this.$store.state.theme.currentThemeIndex;
    }

  },
  watch: {

    themeChange: function() {
      this.setTheme();
    }

  }
}
</script>