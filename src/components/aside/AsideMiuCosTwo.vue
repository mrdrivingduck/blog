<!-- 

  @author - Mr Dk.
  @version - 2020/01/26

  @description - 
    The aside component for displaying μC/OS-II code analysis
    Loading the resource from GitHub using GitHub API v3

-->

<template>
  <div>

    <!-- Sub-menu of notes -->
    <el-submenu
      v-if="!fail"
      v-loading="loading"
      :index="this.index + ''">
      
      <template slot="title">
        <span> 🐤 μC/OS-II Code Analysis (notes) </span>
      </template>

      <!-- Every notes -->
      <el-menu-item
        v-for="(folder, idx) in notes"
        v-loading="loading"
        @click="clickFolder(folder)"
        :key="folder.name"
        :index="index + '-' + (idx + 1)">

        <template slot="title">
          <span> 📂 {{ folder.name }} </span>
        </template>

      </el-menu-item>
    </el-submenu>

    <!-- Loading failure -->
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
  props: ["index"],

  data: function () {
    return {
      repo: "us_os_ii_code_notes",

      notes: null, // For repository data storage
      loading: true, // For displaying the status of loading data
      fail: false, // For displaying the result of HTTP request
      failReason: "" // For displaying the reason of HTTP request failure
    }
  },

  methods: {

    // Loading all notes of how-linux-works repository
    loadNotes: function (url) {
      const apis = this.$store.state.githubapi.api;
      const dirNameReg = apis[this.repo].dir_filter;
      
      // Set loading status
      this.loading = true;

      // Issue HTTP request
      this.$http.get(url).then(response => {
        this.notes = [];
        for (let i = 0; i < response.data.length; i++) {
          if (dirNameReg.test(response.data[i].name)) {
            let { name, sha, size, url, html_url, path } = response.data[i];
            this.notes.push({
              name, sha, url, html_url, path, size
            });
          }
        }

        // Sort the notes according to chapter index
        this.notes.sort(function (a, b) {
          let idxFront = a.name.split("-")[0].split(" ")[1];
          let idxBack = b.name.split("-")[0].split(" ")[1];
          return parseFloat(idxFront) - parseFloat(idxBack);
        });

        // Directories loading complete
        this.loading = false;

      }).catch(error => {
        // HTTP failed
        this.fail = true;
        this.failReason = error.message;
      });
    },

    clickFolder: function (folder) {
      let url = folder.url;
      this.$store.commit("setNotesUrl", { url });
      this.$store.commit("setCurrentAsideIndex", { index: this.index });
      this.$store.commit("setCurrentContent", { currentComponent: "ContentNoteList" });
    }

  },
  
  created: function () {
    // Initializing the data from GitHub
    let url = this.$store.state.githubapi.api[this.repo].content;
    this.loadNotes(url);
  }
}
</script>