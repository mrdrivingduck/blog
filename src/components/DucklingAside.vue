<!-- 

  @author - Mr Dk.
  @version - 2019/07/01

  @description - 
    The aside component for guiding

-->

<template>
  <div>
    
    <el-menu>

      <el-submenu>
        <template slot="title">
          <i class="el-icon-edit"></i>
          <span> Notes </span>
        </template>

        <el-submenu>
          <template slot="title">
            <i class="el-icon-location"></i>
            <span>Java</span>
          </template>

          <el-menu-item index="1-1">选项1</el-menu-item>
          <el-menu-item index="1-2">选项2</el-menu-item>

        </el-submenu>

      </el-submenu>

      <el-submenu>
        <template slot="title">
          <i class="el-icon-document"></i>
          <span> Paper Outline </span>
        </template>

      </el-submenu>

    </el-menu>
    
  </div>
</template>

<style>

</style>

<script>
export default {
  
}
</script>