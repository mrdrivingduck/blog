<!-- 

  @author - Mr Dk.
  @version - 2020/02/29

  @description - 
    The aside component for displaying paper outlines

-->

<template>
  <div>

    <!-- Sub-menu of paper outline -->
    <el-submenu
      :index="this.index + ''">
      
      <template slot="title">
        <span> 🔍 Paper Outline </span>
      </template>

      <!-- Every directories -->
      <el-menu-item
        v-for="(dir, dirIdx) in directory"
        @click="clickDir"
        :path="dir.name"
        :key="dir.name"
        :index="index + '-' + (dirIdx + 1)">

        <template slot="title">
          <span> 📂 {{ dir.name }} </span>
        </template>
      </el-menu-item>

    </el-submenu>
    
  </div>
</template>

<script>
export default {
  props: ["index", "directory"],
  data() {
    return  {
      repo: "paper_outline"
    };
  },
  methods: {

    clickDir(folder) {
      this.$router.push({
        path: "/outlinelist",
        query: {
          repo: this.repo,
          path: folder.$attrs.path
        }
      }).catch(err => { err });
    }

  }
}
</script>