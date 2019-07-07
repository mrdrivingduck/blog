<!-- 

  @author - Mr Dk.
  @version - 2019/07/07

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
        <i class="el-icon-edit"></i>
        <span> Notes </span>
      </template>

      <!-- Every directories -->
      <el-submenu
        v-for="(dir, dirIdx) in noteDir"
        v-loading="dir.loading"
        :key="dir.name"
        :index="index + '-' + (dirIdx + 1)">

        <template slot="title">
          <i class="el-icon-folder"></i>
          <span> {{ dir.name }} </span>
        </template>

        <!-- Every notes in a directory -->
        <el-menu-item
          v-for="(note, noteIdx) in noteDir[dirIdx].notes"
          @click="clickNote(note.url)"
          :key="note.name"
          :index="index + '-' + (dirIdx + 1) + '-' + (noteIdx + 1)">

          <template slot="title">
            <i class="el-icon-edit-outline"></i>
            <span> {{ note.name }} </span>
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

<style>

</style>

<script>
// Filter only directory
const dirNameReg = /^[A-Z].*$/;

export default {
  props: ["index"],

  data: function () {
    return {
      /**
       * For repository data storage
       */
      noteDir: null,
      /**
       * For displaying the status of loading data
       */
      loading: true,
      /**
       * For displaying the result of HTTP request
       */
      fail: false,
      /**
       * For displaying the reason of HTTP request failure
       */
      failReason: ""
    }
  },

  methods: {

    /**
     * Loading all directories of notes repository
     */
    loadDirectories: function (url) {
      // Set loading status
      this.loading = true;

      // Issue HTTP request
      this.$http.get(url).then(response => {
        this.noteDir = [];
        for (let i = 0; i < response.body.length; i++) {
          if (dirNameReg.test(response.body[i].name) && response.body[i].type === "dir") {
            let { name, sha, type, url } = response.body[i];
            this.noteDir.push({
              name, sha, type, url
            });
          }
        }

        // Start loading every directory
        for (let i = 0; i < this.noteDir.length; i++) {
          this.loadNotes(this.noteDir[i].url, this.noteDir[i]);
        }

        // Directories loading complete
        this.loading = false;

      }, error => {
        // HTTP failed
        this.fail = true;
        this.failReason = "Status: " + error.status;
      });
    },

    /**
     * Loading all notes in one of the directories
     */
    loadNotes: function (url, dirObj) {
      // Set loading status
      this.$set(dirObj, "loading", true);
      // Issue HTTP request for every directory's contents
      this.$http.get(url).then(response => {
        // Inject the content into directory
        let dirNotes = [];
        for (let i = 0; i < response.body.length; i++) {
          let { name, sha, type, size, url } = response.body[i];
          dirNotes.push({
            name, sha, type, size, url
          });
        }
        this.$set(dirObj, "notes", dirNotes);
        // Notes loading complete
        this.$set(dirObj, "loading", false);

      }, error => {
        // HTTP failed
        this.fail = true;
        this.failReason = "Status: " + error.status;
      });
    },

    clickNote: function (url) {
      this.$store.commit("setMarkdownUrl", { url });
      this.$store.commit("setCurrentContent", { currentComp: "ContentMarkdown" });
    }

  },
  
  created: function () {
    // Initializing the data from GitHub
    this.loadDirectories("https://api.github.com/repos/mrdrivingduck/notes/contents/");
  }
}
</script>