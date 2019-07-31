<!-- 

  @author - Mr Dk.
  @version - 2019/07/31

  @description - 
    The aside component for displaying How-Linux-Works
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
        <span> 🐧 How Linux Works </span>
      </template>

      <!-- Every notes -->
      <el-menu-item
        v-for="(note, idx) in notes"
        v-loading="loading"
        @click="clickNote(note)"
        :key="note.name"
        :index="index + '-' + (idx + 1)">

        <template slot="title">
          <span> 📃 {{ note.name }} </span>
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

<style>

</style>

<script>
export default {
  props: ["index"],

  data: function () {
    return {
      notes: null, // For repository data storage
      loading: true, // For displaying the status of loading data
      fail: false, // For displaying the result of HTTP request
      failReason: "" // For displaying the reason of HTTP request failure
    }
  },

  methods: {

    // Loading all notes of how-linux-works repository
    loadNotes: function (url) {
      const chapterReg = this.$store.state.regexpre.chapterNameReg;
      // Set loading status
      this.loading = true;

      // Issue HTTP request
      this.$http.get(url).then(response => {

        this.notes = [];
        for (let i = 0; i < response.body.length; i++) {
          if (chapterReg.test(response.body[i].name)) {
            let { name, sha, size, url, html_url, path } = response.body[i];
            this.notes.push({
              name: name.replace(".md", ""), sha, url, html_url, path, size
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

      }, error => {
        // HTTP failed
        this.fail = true;
        this.failReason = "Status: " + error.status;
      });
    },

    // Jump to the note detail
    clickNote: function (noteObj) {
      this.$store.commit("setMarkdownUrl", {
        url: noteObj.url,
        metadata: {
          link: noteObj.html_url,
          sha: noteObj.sha,
          size: noteObj.size,
          path: noteObj.path
        }
      });
      this.$store.commit("setCommitUrlIndex", { index: this.index });
      this.$store.commit("setCurrentContent", { currentComponent: "ContentMarkdown" });
    }
  },
  
  created: function () {
    // Initializing the data from GitHub
    let url = this.$store.state.githubapi.api[this.index].content;
    this.loadNotes(url);
  }
}
</script>