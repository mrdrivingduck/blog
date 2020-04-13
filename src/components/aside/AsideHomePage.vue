<!-- 

  @author - Mr Dk.
  @version - 2020/04/13

  @description - 
    Back to my home page.

-->

<template>
  <div>

    <el-menu-item
      @click="jumpToHomePage"
      :index="this.index + ''">
      
      <template slot="title">
        <span> 🏡 Home Page </span>
      </template>

    </el-menu-item>
    
  </div>
</template>

<script>
export default {
  props: ["index"],
  methods: {

    jumpToHomePage: function() {
      window.location.href = "https://mrdrivingduck.cn";
    }

  }
}
</script>