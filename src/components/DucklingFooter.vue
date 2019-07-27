<!-- 

  @author - Mr Dk.
  @version - 2019/07/27

  @description - 
    The index component for displaying fotter

-->

<template>
  <div :class="theme">

    <el-divider></el-divider>

    <div style="margin-bottom: 50px;">

      <el-row type="flex">

        <el-col
          :span="13">
          <p style="float: right; margin-right: 10px">mrdrivingduck©, 2019</p>
        </el-col>

        <el-col :span="11">
          <el-link
            style="width: 32px; height: 32px; vertical-align:middle; margin-left: 10px"
            :underline="false"
            :href="repo_url">
            <el-image
              :src="theme === 'dark' ? github_link_dark : github_link_light"
              fit="fit">
            </el-image>
          </el-link>

          <span
            style="display: inline-block; height: 100%; vertical-align: middle;">
          </span>
        </el-col>

      </el-row>

      <p style="text-align: center;">Contact me - 
        <el-link
          type="primary"
          href="mailto:mrdrivingduck@gmail.com">
          mrdrivingduck@gmail.com
        </el-link>
      </p>

    </div>

  </div>
</template>

<style>
  .dark p {
    color: #ffffff;
  }
  .light p {
    color: #000000;
  }
</style>

<script>
export default {
  props: [ "theme" ],
  data: function() {
    return {
      github_link_dark: "icon/github-circle-dark.svg",
      github_link_light: "icon/github-circle-light.svg",
      repo_url: "https://github.com/mrdrivingduck/mrdrivingduck.github.io"
    };
  }
}
</script>

