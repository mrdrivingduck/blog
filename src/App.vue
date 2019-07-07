<!-- 

  @author - Mr Dk.
  @version - 2019/07/07

  @description - 
    The entry component.

-->

<template>
  <div id="app">

    <!-- Header -->
    <el-header>
      <duckling-header></duckling-header>
    </el-header>

    <!-- Central part -->
    <el-container>

      <!-- Aside on the left -->
      <el-aside width=30%>
        <duckling-aside></duckling-aside>
      </el-aside>

      <!-- Content on the right -->
      <el-main width=70% class="content">
        <duckling-content></duckling-content>
      </el-main>
      
    </el-container>

    <!-- Footer -->
    <el-footer>
      <duckling-footer></duckling-footer>
    </el-footer>
    
  </div>
</template>

<style>
  .content {
    margin-left: 50px;
  }
</style>

<script>
/**
 * The basic component of blog over here
 */
import DucklingHeader from "./components/DucklingHeader.vue";
import DucklingAside from "./components/DucklingAside.vue";
import DucklingContent from "./components/DucklingContent.vue";
import DucklingFooter from "./components/DucklingFooter.vue";

export default {
  name: 'app',
  components: {
    DucklingHeader,
    DucklingAside,
    DucklingContent,
    DucklingFooter
  }
}
</script>
