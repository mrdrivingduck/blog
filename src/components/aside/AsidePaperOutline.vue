<!-- 

  @author - Mr Dk.
  @version - 2021/08/08

  @description - 
    The aside component for displaying Paper-Outline (Issues)
    Loading the resource from GitHub using GitHub API v4

-->

<template>
  <div>

    <!-- item -->
    <el-menu-item
      @click="this.load"
      :index="this.index + ''">
      
      <template slot="title">
        <span> 🔍 Paper Outline </span>
      </template>

    </el-menu-item>
    
  </div>
</template>

<script>
export default {
  props: ["index"],

  data() {
    return {
      repo: "paper_outline"
    }
  },

  methods: {

    load() {
      this.$router.push({
        path: "/issues",
        query: {
          repo: this.repo
        }
      }).catch(err => { err });
    }

  }
}
</script>
