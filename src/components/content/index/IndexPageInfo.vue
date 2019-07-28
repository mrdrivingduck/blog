<!-- 

  @author - Mr Dk.
  @version - 2019/07/27

  @description - 
    The index component for displaying page information

-->

<template>
  <div :class="theme">

    <p style="font-size: 30px;"> Author </p>
    <p> 🦆 Mr Dk. </p>
    <p> Page build by <i>duckling</i> version 0.1.6 </p>

    <el-divider></el-divider>

    <div
      v-if="!fail"
      v-loading="commitLoading">

      <p style="font-size: 30px;"> Last commit </p>
      <p> 📤 {{ lastCommitMessage }} </p>
      <p> <b>⌚{{ lastCommitTime }}</b> by <b>{{ lastCommitter }}</b> </p>
    </div>

    <el-divider></el-divider>

    <div
      v-if="!fail"
      v-loading="deployLoading">

      <p style="font-size: 30px;"> Last deploy </p>
      <b>🔏{{ lastDeploySha }}</b>
      <p> <b>⌚{{ lastDeployTime }}</b> by <b>{{ lastDeployer }}</b> </p>
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

<style>
  .dark p {
    color: #ffffff;
  }
  .light p {
    color: #000000;
  }
</style>

<script>
export default {
  props: [ "theme" ],
  data: function() {
    return {
      lastCommitTime: null,
      lastCommitter: null,
      lastCommitMessage: null,
      lastCommitSha: null,
      commitLoading: false,

      lastDeployTime: null,
      lastDeployer: null,
      lastDeploySha: null,
      deployLoading: false,

      fail: false,
      failReason: "",

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
          name: "Vue CLI",
          description: "🛠️ Standard Tooling for Vue.js Development.",
          link: "https://cli.vuejs.org/"
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
          description: "Javascript syntax highlighter.",
          link: "https://github.com/mrdrivingduck/highlight.js"
        },
        {
          name: "GitHub API v3",
          description: "The official GitHub REST API v3.",
          link: "https://developer.github.com/v3/"
        },
        {
          name: "GitHub Pages",
          description: "Websites for you and your projects.",
          link: "https://pages.github.com/"
        },
        {
          name: "Aliyun",
          description: "More ThanJust Cloud.",
          link: "https://www.aliyun.com/"
        }
      ]
    };
  },
  created: function() {
    this.getCommits();
    this.getDeploys();
  },
  methods: {

    getCommits: function() {
      const url = this.$store.state.githubapi.commit_url[0];
      this.commitLoading = true;
      this.fail = false;
      this.failReason = "";

      this.$http.get(url).then(response => {

        let { commit, sha } = response.body[0];
        let { committer, message } = commit;
        let { name, date } = committer;
        this.lastCommitTime = date;
        this.lastCommitter = name;
        this.lastCommitMessage = message;
        this.lastCommitSha = sha;

        this.commitLoading = false;

      }, err => {
        this.fail = true;
        this.failReason = "Status: " + err.status;
      });
    },

    getDeploys: function() {
      const url = this.$store.state.githubapi.deploy;
      this.deployLoading = true;
      this.fail = false;
      this.failReason = "";

      this.$http.get(url).then(response => {

        let { creator, sha, updated_at } = response.body[0];
        let { login } = creator;
        this.lastDeployTime = updated_at;
        this.lastDeploySha = sha;
        this.lastDeployer = login;

        this.deployLoading = false;

      }, err => {
        this.fail = true;
        this.failReason = "Status: " + err.status;
      });
    }

  }
}
</script>