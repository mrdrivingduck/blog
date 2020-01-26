<!-- 

  @author - Mr Dk.
  @version - 2020/01/27

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
        <span> 🔍 Paper Outline </span>
      </template>

      <!-- Every directories -->
      <el-menu-item
        v-for="(dir, dirIdx) in outlineDir"
        v-loading="dir.loading"
        @click="clickDir"
        :meta="dir"
        :key="dir.name"
        :index="index + '-' + (dirIdx + 1)">

        <template slot="title">
          <span> 📂 {{ dir.name }} </span>
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
    return  {
      repo: "paper_outline",

      outlineDir: null, // For repository data storage
      loading: true, // For displaying loading status
      fail: false, // Set to true if loading error occurs
      failReason: "", // Reason of failure
    };
  },
  methods: {

    loadDirectories: function (url) {
      // Set loading status
      this.loading = true;

      const apis = this.$store.state.githubapi.api;
      const dirNameReg = apis[this.repo].dir_filter;

      // Issur HTTP Request
      this.$http.get(url).then(response => {
        
        this.outlineDir = [];
        for (let i = 0; i < response.data.length; i++) {
          if (dirNameReg.test(response.data[i].name) &&
              response.data[i].type === "dir") {
            let { name, url, path } = response.data[i];
            this.outlineDir.push({ name, url, path });
          }
        }
        
        // Directories loading complete
        this.loading = false;

      }).catch(error => {
        // HTTP failed
        this.fail = true;
        this.failReason = error.message;
      });
    },

    clickDir: function (item) {
      let path = item.$attrs.meta.path;
      this.$router.push({
        path: "/outlinelist",
        query: {
          repo: this.repo,
          path
        }
      }).catch(err => { err });
    }

  },
  created: function () {
    // Initializing the data from GitHub
    let url = this.$store.state.githubapi.api[this.repo].content;
    this.loadDirectories(url);
  }
}
</script>