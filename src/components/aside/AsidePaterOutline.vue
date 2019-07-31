<!-- 

  @author - Mr Dk.
  @version - 2019/07/30

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

<style>

</style>

<script>
export default {
  props: ["index"],
  data: function () {
    return  {
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
      // Issur HTTP Request
      this.$http.get(url).then(response => {
        
        const dirNameReg = this.$store.state.regexpre.dirNameReg;
        this.outlineDir = [];
        for (let i = 0; i < response.body.length; i++) {
          if (dirNameReg.test(response.body[i].name) && response.body[i].type === "dir") {
            let { name, url, sha, html_url } = response.body[i];
            this.outlineDir.push({ name, url, sha, html_url });
          }
        }
        
        // Directories loading complete
        this.loading = false;

      }, error => {
        // HTTP failed
        this.fail = true;
        this.failReason = "Status: " + error.status;
      });
    },

    clickDir: function (item) {
      let url = item.$attrs.meta.url;
      this.$store.commit("setOutlineUrl", { url });
      this.$store.commit("setCurrentContent", { currentComponent: "ContentPaperOutline" });
      this.$store.commit("setCommitUrlIndex", { index: this.index });
    }

  },
  created: function () {
    // Initializing the data from GitHub
    let url = this.$store.state.githubapi.api[this.index].content;
    this.loadDirectories(url);
  }
}
</script>