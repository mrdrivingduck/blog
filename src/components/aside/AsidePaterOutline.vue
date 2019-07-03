<!-- 

  @author - Mr Dk.
  @version - 2019/07/03

  @description - 
    The aside component for displaying paper outlines

-->

<template>
  <div>

    <!-- Sub-menu of paper outline -->
    <el-submenu
      v-if="!fail"
      v-loading="loading"
      :index="this.index + ''">
      
      <template slot="title">
        <i class="el-icon-document-copy"></i>
        <span> Paper Outline </span>
      </template>

      <!-- Every directories -->
      <el-submenu
        v-for="(dir, dirIdx) in outlineDir"
        v-loading="dir.loading"
        :key="dir.name"
        :index="index + '-' + (dirIdx + 1)">

        <template slot="title">
          <i class="el-icon-folder"></i>
          <span> {{ dir.name }} </span>
        </template>

        <!-- Every outline in a directory -->
        <el-menu-item
          v-for="(outline, outlineIdx) in outlineDir[dirIdx].outlines"
          :key="outline.name"
          :index="index + '-' + (dirIdx + 1) + '-' + (outlineIdx + 1)">

          <template slot="title">
            <i class="el-icon-edit-outline"></i>
            <span> {{ outline.name }} </span>
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
// Filter only outline markdown files
const outlineNameReg = /^Outline.*$/;

export default {
  props: ["index"],
  data: function () {
    return  {
      /**
       * For repository data storage
       */
      outlineDir: null,
      /**
       * For displaying loading status
       */
      loading: true,
      /**
       * Set to true if loading error occurs
       */
      fail: false,
      /**
       * Reason of failure
       */
      failReason: ""
    };
  },
  methods: {

    loadDirectories: function (url) {
      // Set loading status
      this.loading = true;
      // Issur HTTP Request
      this.$http.get(url).then(response => {
        
        this.outlineDir = [];
        for (let i = 0; i < response.body.length; i++) {
          if (dirNameReg.test(response.body[i].name) && response.body[i].type === "dir") {
            this.outlineDir.push(response.body[i]);
          }
        }
        // Set loading status for every directory
        // Start loading every directory
        for (let i = 0; i < this.outlineDir.length; i++) {
          this.$set(this.outlineDir[i], "loading", true);
          this.loadOutlinesDir(this.outlineDir[i].url, this.outlineDir[i]);
        }
        // Directories loading complete
        this.loading = false;

      }, error => {
        // HTTP failed
        this.fail = true;
        this.failReason = "Status: " + error.status;
      });
    },

    loadOutlinesDir: function (url, dirObj) {
      this.$http.get(url).then(response => {
        this.$set(dirObj, "outlines", []);
        this.$set(dirObj, "loadingCount", response.body.length);
        for (let i = 0; i < response.body.length; i++) {
          this.loadOutlineFile(response.body[i].url, dirObj);
        }
      }, error => {
        // HTTP failed
        this.fail = true;
        this.failReason = "Status: " + error.status;
      });
    },

    loadOutlineFile: function (url, dirObj) {
      this.$http.get(url).then(response => {
        for (let i = 0; i < response.body.length; i++) {
          if (outlineNameReg.test(response.body[i].name)) {
            dirObj.outlines.push(response.body[i]);
          }
        }
        // Outline loading complete
        dirObj.loadingCount--;
        if (dirObj.loadingCount === 0) {
          dirObj.loading = false;
        }

      }, error => {
        // HTTP failed
        this.fail = true;
        this.failReason = "Status: " + error.status;
      });
    }

  },
  created: function () {
    // Initializing the data from GitHub
    this.loadDirectories("https://api.github.com/repos/mrdrivingduck/paper-outline/contents/")
  }
}
</script>