<!-- 

  @author - Mr Dk.
  @version - 2020/04/13

  @description - 
    Back to blog index page.

-->

<template>
  <div>

    <el-menu-item
      @click="this.backToBlogIndex"
      :index="this.index + ''">
      
      <template slot="title">
        <span> 👀 Blog Index </span>
      </template>

    </el-menu-item>
    
  </div>
</template>

<script>
export default {
  props: ["index"],
  methods: {

    backToBlogIndex: function() {
      // this.$store.commit("setCurrentContent", { currentComponent: "ContentIndex" });
      this.$router.push("/").catch(err => { err });
    }

  }
}
</script>