<!-- 

  @author - Mr Dk.
  @version - 2020/02/04

  @description - 
    The aside component for displaying Understanding-the-JVM
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
        <span> ☕ Understanding the JVM (notes) </span>
      </template>

      <!-- Every notes -->
      <el-menu-item
        v-for="(folder, idx) in notes"
        v-loading="loading"
        @click="clickFolder"
        :meta="folder"
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
      repo: "understanding_the_jvm",

      notes: null, // For repository data storage
      loading: true, // For displaying the status of loading data
      fail: false, // For displaying the result of HTTP request
      failReason: "" // For displaying the reason of HTTP request failure
    }
  },

  methods: {

    // Loading all notes of how-linux-works repository
    loadNotes: function () {
      const apis = this.$store.state.githubapi.api;
      const url = apis[this.repo].content;
      const chapter_reg = apis[this.repo].dir_filter;
      const chapter_sorter = apis[this.repo].sort;
      // Set loading status
      this.loading = true;

      // Issue HTTP request
      this.$http.get(url).then(response => {

        this.notes = [];
        for (let i = 0; i < response.data.length; i++) {
          if (chapter_reg.test(response.data[i].name)) {
            let { name, path } = response.data[i];
            this.notes.push({ name, path });
          }
        }

        // Sort the notes according to chapter index
        this.notes.sort(chapter_sorter);

        // Directories loading complete
        this.loading = false;

      }).catch(error => {
        // HTTP failed
        this.fail = true;
        this.failReason = error.message;
      });
    },

    clickFolder: function (folder) {
      let path = folder.$attrs.meta.path;
      this.$router.push({
        path: "/notelist",
        query: {
          repo: this.repo,
          path
        }
      }).catch(err => { err });
    }

  },
  
  created: function () {
    // Initializing the data from GitHub
    this.loadNotes();
  }
}
</script>