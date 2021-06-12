<!-- 

  @author - Mr Dk.
  @version - 2020/02/29

  @description - 
    The aside component for displaying Understanding-the-JVM
    Loading the resource from GitHub using GitHub API v4

-->

<template>
  <div>

    <!-- Sub-menu of notes -->
    <el-submenu
      :index="this.index + ''">
      
      <template slot="title">
        <span> ☕ Understanding the JVM (notes) </span>
      </template>

      <!-- Every folder -->
      <el-menu-item
        v-for="(folder, idx) in directory"
        @click="clickFolder"
        :path="folder.name"
        :key="folder.name"
        :index="index + '-' + (idx + 1)">

        <template slot="title">
          <span> 📂 {{ folder.name }} </span>
        </template>

      </el-menu-item>
    </el-submenu>
    
  </div>
</template>

<script>
export default {
  props: ["index", "directory"],

  data() {
    return {
      repo: "understanding_the_jvm"
    }
  },

  methods: {

    clickFolder(folder) {
      this.$router.push({
        path: "/notelist",
        query: {
          repo: this.repo,
          path: folder.$attrs.path
        }
      }).catch(err => { err });
    }

  }
  
}
</script>