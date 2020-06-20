<!-- 

  @author - Mr Dk.
  @version - 2020/06/19

  @description - 
    The index component for displaying fotter

-->

<template>
  <div :class="theme">

    <el-divider></el-divider>

    <div style="margin-bottom: 50px;">

      <div style="text-align: center;">
        <el-link
          style="width: 32px; height: 32px;"
          :underline="false"
          :href="repo_url">
          <el-image
            :src="theme === 'dark' ? github_link_dark : github_link_light"
            fit="fit">
          </el-image>
        </el-link>
      </div>

      <div style="text-align: center;">
        <p>
          Copyright © 2018-2020, 
            <el-link
              type="primary"
              href="mailto:mrdrivingduck@gmail.com">
              Jingtang Zhang
            </el-link>
          . <el-link
              type="primary"
              href="LICENSE">
              (MIT License)
            </el-link>
        </p>
      </div>

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
      repo_url: "https://github.com/mrdrivingduck/blog"
    };
  }
}
</script>

