<!-- 

  @author - Mr Dk.
  @version - 2021/02/22

  @description - 
    The aside component for displaying Netty-In-Action.
    Loading the resource from GitHub using GitHub API v4.

-->

<template>
  <div>

    <!-- item -->
    <el-menu-item
      @click="this.load"
      :index="this.index + ''">
      
      <template slot="title">
        <span> ⚙️ Netty in Action (notes) </span>
      </template>

    </el-menu-item>
    
  </div>
</template>

<script>
export default {
  props: ["index"],

  data() {
    return {
      repo: "netty_in_action_notes"
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