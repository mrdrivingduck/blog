<!-- 

  @author - Mr Dk.
  @version - 2020/08/28

  @description - 
    The aside component for displaying Spring-Microservices-In-Action
    Loading the resource from GitHub using GitHub API v4

-->

<template>
  <div>

    <!-- item -->
    <el-menu-item
      @click="this.load"
      :index="this.index + ''">
      
      <template slot="title">
        <span> ☁️ Spring Microservices in Action (notes) </span>
      </template>

    </el-menu-item>
    
  </div>
</template>

<script>
export default {
  props: ["index"],

  data() {
    return {
      repo: "spring_microservices_notes"
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