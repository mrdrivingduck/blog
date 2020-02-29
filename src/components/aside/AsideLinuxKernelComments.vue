<!-- 

  @author - Mr Dk.
  @version - 2020/02/29

  @description - 
    The aside component for displaying Linux-Kernel-Comments
    Loading the resource from GitHub using GitHub API v4

-->

<template>
  <div>

    <!-- Sub-menu of notes -->
    <el-submenu
      :index="this.index + ''">
      
      <template slot="title">
        <span> 🐧 Linux Kernel Comments (notes) </span>
      </template>

      <!-- Every directory -->
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
      repo: "linux_kernel_comments_notes"
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