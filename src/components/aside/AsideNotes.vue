<!-- 

  @author - Mr Dk.
  @version - 2020/02/29

  @description - 
    The aside component for displaying note list
    Loading the resource from GitHub using GitHub API v4

-->

<template>
  <div>

    <!-- Sub-menu of notes -->
    <el-submenu
      :index="this.index + ''">
      
      <template slot="title">
        <span> 📝 Notes </span>
      </template>

      <!-- Every directories -->
      <el-submenu
        v-for="(dir, dirIdx) in directory"
        :key="dir.name"
        :index="index + '-' + (dirIdx + 1)">

        <template slot="title">
          <span> 📂 {{ dir.name }} </span>
        </template>

        <!-- Every notes in a directory -->
        <el-menu-item
          v-for="(note, noteIdx) in directory[dirIdx].object.entries"
          @click="clickNote(note)"
          :key="note.name"
          :index="index + '-' + (dirIdx + 1) + '-' + (noteIdx + 1)">

          <template slot="title">
            <span> 📃 {{ note.name.replace(".md", "") }} </span>
          </template>

        </el-menu-item>
      </el-submenu>
    </el-submenu>
    
  </div>
</template>

<script>
export default {
  props: ["index", "directory"],

  data: function() {
    return {
      repo: "notes"
    }
  },

  methods: {

    // Jump to the note detail
    clickNote: function (noteObj) {
      this.$router.push({
        path: "/markdown",
        query: {
          repo: this.repo,
          path: noteObj.path
        }
      }).catch(err => { err });
    }
  }
}
</script>