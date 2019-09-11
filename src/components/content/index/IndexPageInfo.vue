<!-- 

  @author - Mr Dk.
  @version - 2019/09/10

  @description - 
    The index component for displaying page information

-->

<template>
  <div :class="theme">
    
    <div
      v-if="!fail"
      v-loading="sourceLoading">

      <p style="font-size: 30px;"> Author </p>
      <p><b> 🦆 {{ this.ducklingAuthor }} </b></p>
      <p> Page build by <i> {{ this.ducklingName }} </i> version <b> {{ this.ducklingVersion }} </b> </p>
    </div>

    <el-divider></el-divider>

    <div
      v-if="!fail"
      v-loading="commitLoading">

      <p style="font-size: 30px;"> Last commit </p>
      <p> 📤 {{ lastCommitMessage }} </p>
      <p><b> ⌚ {{ lastCommitTime }}</b> by <b> {{ lastCommitter }} </b> </p>
    </div>

    <el-divider></el-divider>

    <div
      v-if="!fail"
      v-loading="deployLoading">

      <p style="font-size: 30px;"> Last deploy </p>
      <p><b> 🔏 {{ lastDeploySha }}</b></p>
      <p><b> ⌚ {{ lastDeployTime }}</b> by <b> {{ lastDeployer }} </b> </p>
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
export default {
  props: [ "theme" ],
  data: function() {
    return {

      sourceLoading: false,
      ducklingName: "",
      ducklingAuthor: "",
      ducklingVersion: "",

      // Last commit info
      lastCommitTime: null,
      lastCommitter: null,
      lastCommitMessage: null,
      lastCommitSha: null,
      commitLoading: false,

      // Last deploy info
      lastDeployTime: null,
      lastDeployer: null,
      lastDeploySha: null,
      deployLoading: false,

      // HTTP status
      fail: false,
      failReason: "",

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
          name: "Vue CLI",
          description: "🛠️ Standard Tooling for Vue.js Development.",
          link: "https://cli.vuejs.org/"
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
          description: "More Than Just Cloud.",
          link: "https://www.aliyun.com/"
        }
      ]
    };
  },
  created: function() {
    this.getSource();
    this.getCommits();
    this.getDeploys();
  },
  methods: {

    // Get last commit info
    getCommits: function() {
      const url = this.$store.state.githubapi.api[0].commit;
      this.commitLoading = true;
      this.fail = false;
      this.failReason = "";

      this.$http.get(url).then(response => {
        // Fill the data
        let { commit, sha } = response.data[0];
        let { committer, message } = commit;
        let { name, date } = committer;
        this.lastCommitTime = date;
        this.lastCommitter = name;
        this.lastCommitMessage = message;
        this.lastCommitSha = sha;
        // Set commit loading status
        this.commitLoading = false;

      }).catch(error => {
        // HTTP failed
        this.fail = true;
        this.failReason = error;
      });
    },

    // Get last deploy info
    getDeploys: function() {
      const url = this.$store.state.githubapi.api[0].deploy;
      this.deployLoading = true;
      this.fail = false;
      this.failReason = "";

      this.$http.get(url).then(response => {
        // Fill the data
        let { creator, sha, updated_at } = response.data[0];
        let { login } = creator;
        this.lastDeployTime = updated_at;
        this.lastDeploySha = sha;
        this.lastDeployer = login;
        // Set deploy loading status
        this.deployLoading = false;

      }).catch(error => {
        // HTTP failed
        this.fail = true;
        this.failReason = error;
      });
    },

    getSource: function () {
      const url = this.$store.state.githubapi.duckling.url;
      const auth = this.$store.state.githubapi.authorization;
      this.sourceLoading = true;
      this.fail = false;
      this.failReason = "";

      this.$http.get(url, {
        headers: {
          "Authorization": auth
        }
      }).then(response => {
        
        if (response.data.encoding === "base64") {
          // Parse encoded Base64 to markdown
          let version = decodeURIComponent(escape(window.atob(response.data.content)));
          let obj = JSON.parse(version);
          this.ducklingName = obj["name"];
          this.ducklingAuthor = obj["author"]["name"];
          this.ducklingVersion = obj["version"];

        } else {
          // Encoding not support
          this.ducklingVersion = "";
        }

        this.sourceLoading = false;

      }).catch(error => {
        // HTTP failed
        this.fail = true;
        this.failReason = error;
      });
    }

  }
}
</script>