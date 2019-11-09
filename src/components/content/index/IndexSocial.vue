<!-- 

  @author - Mr Dk.
  @version - 2019/07/27

  @description - 
    The index component for displaying social links

-->

<template>
  <div :class="theme">

    <el-row
      v-for="social in socials"
      :key="social.name"
      type="flex">

      <!-- Social icon -->
      <el-col :span="3">
        <div style="height: 100%; float: right; margin-right: 20px">
          <el-image
            style="width: 32px; height: 32px; vertical-align:middle;"
            :src="theme === 'dark' ? social.icon_dark : social.icon_light"
            fit="fit">
          </el-image>
          <span
            style="display: inline-block; height: 100%; vertical-align: middle;">
          </span>
        </div>
      </el-col>

      <!-- Social link url -->
      <el-col :span="16">
        <p>
          {{ social.name }} -
          <el-link
            type="primary"
            :href="social.link">
            @{{ social.login }}
          </el-link>
        </p>
      </el-col>

    </el-row>

  </div>
</template>

<script>
export default {
  props: [ "theme" ],
  data: function() {
    return {
      socials: [
        {
          name: "GitHub",
          login: "mrdrivingduck",
          link: "https://github.com/mrdrivingduck",
          icon_light: "icon/github-light.svg",
          icon_dark: "icon/github-dark.svg"
        },
        {
          name: "GitLab",
          login: "mrdrivingduck",
          link: "https://gitlab.com/mrdrivingduck",
          icon_light: "icon/gitlab-light.svg",
          icon_dark: "icon/gitlab-dark.svg"
        },
        {
          name: "Instagram",
          login: "mrdrivingduck",
          link: "https://www.instagram.com/mrdrivingduck/",
          icon_light: "icon/ins-light.svg",
          icon_dark: "icon/ins-dark.svg"
        },
        {
          name: "Twitter",
          login: "mrdrivingduck",
          link: "https://twitter.com/mrdrivingduck",
          icon_light: "icon/twitter-light.svg",
          icon_dark: "icon/twitter-dark.svg"
        },
        {
          name: "Weibo",
          login: "肉喇叭叭叭叭",
          link: "https://weibo.com/u/1638054144",
          icon_light: "icon/weibo-light.svg",
          icon_dark: "icon/weibo-dark.svg"
        }
      ]
    };
  }
}
</script>