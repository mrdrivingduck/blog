<!-- 

  @author - Mr Dk.
  @version - 2020/01/26

  @description - 
    The aside component for displaying Linux Kernel Development notes
    Loading the resource from GitHub using GitHub API v3

-->

<template>
  <div>

    <!-- item -->
    <el-menu-item
      v-if="!fail"
      v-loading="loading"
      @click="this.load"
      :index="this.index + ''">
      
      <template slot="title">
        <span> 🐧 Linux Kernel Development (notes) </span>
      </template>

    </el-menu-item>

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
      repo: "linux_kernel_development_notes",

      notes: null, // For repository data storage
      loading: false, // For displaying the status of loading data
      fail: false, // For displaying the result of HTTP request
      failReason: "" // For displaying the reason of HTTP request failure
    }
  },

  methods: {

    load: function () {
      let url = this.$store.state.githubapi.api[this.repo].content;
      this.$store.commit("setNotesUrl", { url });
      this.$store.commit("setCurrentAsideIndex", { index: this.index });
      this.$store.commit("setCurrentContent", { currentComponent: "ContentNoteList" });
    }

  }
}
</script>