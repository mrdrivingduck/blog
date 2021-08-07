<!-- 

  @author - Mr Dk.
  @version - 2021/08/08

  @description - 
    The main component for displaying contents

-->

<template>
  <div>
    
    <router-view :theme="theme"></router-view>

  </div>
</template>

<script>
export default {
  props: [ "theme" ]
}
</script>

<style>
  /* Transparent background */
  .el-pager li,
  .el-pagination .btn-next,
  .el-pagination .btn-prev,
  .el-pagination button:disabled {
    background: #ffffff00;
  }

  .dark .el-pager li.active,
  .dark .el-pager li:hover,
  .dark .el-pagination button:hover {
    color: #ffd04b;
  }
  .dark .el-pager li,
  .dark .el-pagination button:enabled {
    color: #ffffff;
  }
  .dark .el-pagination button:disabled {
    color: #707275;
  }

  .light .el-pager li.active,
  .light .el-pager li:hover,
  .light .el-pagination button:hover {
    color: #9567e4;
  }

  .el-tag {
    margin-left: 5px;
    border-color: #2d2d2d00;
  }
</style>
