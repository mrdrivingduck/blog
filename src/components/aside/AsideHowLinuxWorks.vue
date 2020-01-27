<!-- 

  @author - Mr Dk.
  @version - 2020/01/27

  @description - 
    The aside component for displaying How-Linux-Works
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
        <span> 🐧 How Linux Works (notes) </span>
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
      repo: "how_linux_works_notes",

      notes: null, // For repository data storage
      loading: false, // For displaying the status of loading data
      fail: false, // For displaying the result of HTTP request
      failReason: "" // For displaying the reason of HTTP request failure
    }
  },

  methods: {

    load: function () {
      this.$router.push({
        path: "/notelist",
        query: {
          repo: this.repo,
          path: ""
        }
      }).catch(err => { err });
    }

  }
}
</script>