<!-- 

  @author - Mr Dk.
  @version - 2019/07/14

  @description - 
    Component of header

-->

<template>
  <div>
    
    <header-slider class="slider"></header-slider>

  </div>
</template>

<style>
  .slider {
    width: 5%;
    float: right;
  }
</style>

<script>
import HeaderSlider from "./header/HeaderSlider.vue";

export default {
  components: {
    HeaderSlider
  }
}
</script>

