<!-- 

  @author - Mr Dk.
  @version - 2021/04/11

  @description - 
    The aside component for displaying the Annotated STL sources.
    Loading the resource from GitHub using GitHub API v4.

-->

<template>
  <div>

    <!-- Sub-menu of notes -->
    <el-submenu
      :index="this.index + ''">
      
      <template slot="title">
        <span> ⚒️ The Annotated STL Sources (notes) </span>
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
      repo: "the_annotated_stl_sources_notes"
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
