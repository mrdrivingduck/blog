<!-- 

  @author - Mr Dk.
  @version - 2021/03/17

  @description - 
    Component of header

-->

<template>
  <div>
    
    <el-row :gutter="24" type="flex" align="middle" justify="center">

      <el-col :span="12">
        
      </el-col>

      <el-col :span="10">
        <header-location :theme="theme"></header-location>
      </el-col>

      <el-col :span="2">
        <header-slider class="slider"></header-slider>
      </el-col>

    </el-row>

  </div>
</template>

<style>
  .slider {
    width: 100%;
    float: right;
  }
</style>

<script>
import HeaderSlider from "./header/HeaderSlider.vue";
import HeaderLocation from './header/HeaderLocation.vue';

export default {
  props: [ "theme" ],
  components: {
    HeaderSlider,
    HeaderLocation
  }
}
</script>
