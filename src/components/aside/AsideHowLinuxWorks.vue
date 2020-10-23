<!-- 

  @author - Mr Dk.
  @version - 2020/02/29

  @description - 
    The aside component for displaying How-Linux-Works
    Loading the resource from GitHub using GitHub API v4

-->

<template>
  <div>

    <!-- item -->
    <el-menu-item
      @click="this.load"
      :index="this.index + ''">
      
      <template slot="title">
        <span> 🐧 How Linux Works (notes) </span>
      </template>

    </el-menu-item>
    
  </div>
</template>

<script>
export default {
  props: ["index"],

  data() {
    return {
      repo: "how_linux_works_notes"
    }
  },

  methods: {

    load() {
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