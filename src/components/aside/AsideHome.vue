<!-- 

  @author - Mr Dk.
  @version - 2019/10/26

  @description - 
    Back to home page

-->

<template>
  <div>

    <el-menu-item
      @click="this.backToHome"
      :index="this.index + ''">
      
      <template slot="title">
        <span> 👀 Home </span>
      </template>

    </el-menu-item>
    
  </div>
</template>

<script>
export default {
  props: ["index"],
  methods: {

    backToHome: function () {
      this.$store.commit("setCurrentContent", { currentComponent: "ContentIndex" });
    }

  }
}
</script>