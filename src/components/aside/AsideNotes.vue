<!-- 

  @author - Mr Dk.
  @version - 2019/07/30

  @description - 
    The aside component for displaying note list
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
        <span> 📝 Notes </span>
      </template>

      <!-- Every directories -->
      <el-submenu
        v-for="(dir, dirIdx) in noteDir"
        v-loading="dir.loading"
        :key="dir.name"
        :index="index + '-' + (dirIdx + 1)">

        <template slot="title">
          <span> 📂 {{ dir.name }} </span>
        </template>

        <!-- Every notes in a directory -->
        <el-menu-item
          v-for="(note, noteIdx) in noteDir[dirIdx].notes"
          @click="clickNote(note)"
          :key="note.name"
          :index="index + '-' + (dirIdx + 1) + '-' + (noteIdx + 1)">

          <template slot="title">
            <span> 📃 {{ note.name }} </span>
          </template>

        </el-menu-item>
      </el-submenu>
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
      noteDir: null, // For repository data storage
      loading: true, // For displaying the status of loading data
      fail: false, // For displaying the result of HTTP request
      failReason: "" // For displaying the reason of HTTP request failure
    }
  },

  methods: {

    // Loading all directories of notes repository
    loadDirectories: function (url) {
      const dirNameReg = this.$store.state.regexpre.dirNameReg;
      // Set loading status
      this.loading = true;

      // Issue HTTP request
      this.$http.get(url).then(response => {

        this.noteDir = [];
        for (let i = 0; i < response.data.length; i++) {
          if (dirNameReg.test(response.data[i].name) && response.data[i].type === "dir") {
            let { name, sha, type, url, html_url } = response.data[i];
            this.noteDir.push({
              name, sha, type, url, html_url
            });
          }
        }

        // Start loading every directory
        for (let i = 0; i < this.noteDir.length; i++) {
          this.loadNotes(this.noteDir[i].url, this.noteDir[i]);
        }

        // Directories loading complete
        this.loading = false;

      }).catch(error => {
        // HTTP failed
        this.fail = true;
        this.failReason = error;
      });
    },

    // Loading all notes in one of the directories
    loadNotes: function (url, dirObj) {
      // Set loading status
      this.$set(dirObj, "loading", true);
      // Issue HTTP request for every directory's contents
      this.$http.get(url).then(response => {
        // Inject the content into directory
        let dirNotes = [];
        for (let i = 0; i < response.data.length; i++) {
          let { name, sha, type, size, url, html_url, path } = response.data[i];
          dirNotes.push({
            name: name.replace(".md", ""), sha, type, size, url, html_url, path
          });
        }
        this.$set(dirObj, "notes", dirNotes);
        // Notes loading complete
        this.$set(dirObj, "loading", false);

      }).catch(error => {
        // HTTP failed
        this.fail = true;
        this.failReason = error;
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
    this.loadDirectories(url);
  }
}
</script>