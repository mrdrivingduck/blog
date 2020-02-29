<!-- 

  @author - Mr Dk.
  @version - 2020/02/29

  @description - 
    The aside component for displaying μC/OS-II code analysis
    Loading the resource from GitHub using GitHub API v4

-->

<template>
  <div>

    <!-- Sub-menu of notes -->
    <el-submenu
      :index="this.index + ''">
      
      <template slot="title">
        <span> 🐤 μC/OS-II Code Analysis (notes) </span>
      </template>

      <!-- Every folder -->
      <el-menu-item
        v-for="(folder, idx) in directory"
        @click="clickFolder"
        :meta="folder"
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

  data: function() {
    return {
      repo: "us_os_ii_code_notes"
    }
  },

  methods: {

    clickFolder: function (folder) {
      let path = folder.$attrs.meta.path;
      this.$router.push({
        path: "/notelist",
        query: {
          repo: this.repo,
          path
        }
      }).catch(err => { err });
    }

  }

}
</script>