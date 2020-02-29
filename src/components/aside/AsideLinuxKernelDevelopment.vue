<!-- 

  @author - Mr Dk.
  @version - 2020/02/29

  @description - 
    The aside component for displaying Linux Kernel Development notes
    Loading the resource from GitHub using GitHub API v4

-->

<template>
  <div>

    <!-- item -->
    <el-menu-item
      @click="this.load"
      :index="this.index + ''">
      
      <template slot="title">
        <span> 🐧 Linux Kernel Development (notes) </span>
      </template>

    </el-menu-item>
    
  </div>
</template>

<script>
export default {
  props: ["index"],

  data: function() {
    return {
      repo: "linux_kernel_development_notes"
    }
  },

  methods: {

    load: function() {
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