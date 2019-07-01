<!-- 

  @author - Mr Dk.
  @version - 2019/07/01

  @description - 
    The entry component.

-->

<template>
  <div id="app">

    <duckling-header></duckling-header>
    <duckling-guide id="guide"></duckling-guide>
    <duckling-content id="content"></duckling-content>
    
  </div>
</template>

<script>
import DucklingHeader from "./components/DucklingHeader.vue";
import DucklingGuide from "./components/DucklingGuide.vue";
import DucklingContent from "./components/DucklingContent.vue";

export default {
  name: 'app',
  components: {
    DucklingHeader,
    DucklingGuide,
    DucklingContent
  }
}
</script>

<style>
#guide {
  width: 20%;
  float: left;
  background: black
}
#content {
  width: 80%;
  float: right;
  background: red
}
</style>
