<!-- 

  @author - Mr Dk.
  @version - 2019/07/25

  @description - 
    The content component for displaying pernal information

-->

<template>
  <div>

    <el-row>
      <el-col :span="8">
        <div>
          <el-avatar
            :src="avatar"
            style="width: 200px; height: 200px;">
          </el-avatar>
        </div>
      </el-col>
      <el-col :span="12"><div><el-card></el-card></div></el-col>
    </el-row>

  </div>
</template>

<style>

</style>

<script>
export default {
  name: "ContentIndex",
  data: function () {
    return {
      avatar: "avatar.jpg"
    };
  }
}
</script>

