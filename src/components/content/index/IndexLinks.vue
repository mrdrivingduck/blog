<!-- 

  @author - Mr Dk.
  @version - 2020/11/01

  @description - 
    The index component for displaying social links and friend links.

-->

<template>
  <div :class="theme">

    <h1> 🐶 Friend Links </h1>
    <el-row
      v-for="friend in friends"
      :key="friend.name"
      type="flex">

      <el-col :span="3">
        <div style="height: 100%; float: right; margin-right: 20px">
          <el-avatar
            :src="friend.avatar" :size="32" shape="square"
            style="vertical-align:middle;">
            <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"/>
          </el-avatar>
          <span
            style="display: inline-block; height: 100%; vertical-align: middle;">
          </span>
        </div>
      </el-col>

      <!-- Friend link URL -->
      <el-col :span="16">
        <p>
          <el-link
            type="primary"
            :href="friend.link">
            {{ friend.name }}
          </el-link>
        </p>
      </el-col>

    </el-row>



    <el-divider></el-divider>


    <h1> 🐺 Team Links </h1>
    <el-row
      v-for="team in teams"
      :key="team.name"
      type="flex">

      <el-col :span="3">
        <div style="height: 100%; float: right; margin-right: 20px">
          <el-avatar
            :src="team.avatar" :size="32" shape="square"
            style="vertical-align:middle;">
            <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"/>
          </el-avatar>
          <span
            style="display: inline-block; height: 100%; vertical-align: middle;">
          </span>
        </div>
      </el-col>

      <!-- Team link URL -->
      <el-col :span="16">
        <p>
          <el-link
            type="primary"
            :href="team.link">
            {{ team.name }}
          </el-link>
        </p>
      </el-col>

    </el-row>


    <el-divider></el-divider>


    <h1> 🌊 Social Network Links </h1>
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

      <!-- Social link URL -->
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


    <el-divider></el-divider>


    <h1> 🎷 Channel </h1>
    <el-row
      type="flex">

      <!-- Social icon -->
      <el-col :span="3">
        <div style="height: 100%; float: right; margin-right: 20px">
          <el-image
            style="width: 32px; height: 32px; vertical-align:middle;"
            :src="theme === 'dark' ? tgchannel.icon_dark : tgchannel.icon_light"
            fit="fit">
          </el-image>
          <span
            style="display: inline-block; height: 100%; vertical-align: middle;">
          </span>
        </div>
      </el-col>

      <!-- Social link URL -->
      <el-col :span="16">
        <p>
          {{ tgchannel.name }} -
          <el-link
            type="primary"
            :href="tgchannel.link">
            @{{ tgchannel.login }}
          </el-link>
        </p>
      </el-col>

    </el-row>

  </div>
</template>

<script>
export default {
  props: [ "theme" ],
  data() {
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
          name: "Telegram",
          login: "mrdrivingduck",
          link: "https://t.me/mrdrivingduck",
          icon_light: "icon/telegram-light.svg",
          icon_dark: "icon/telegram-dark.svg"
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
          name: "LinkedIn",
          login: "Jingtang Zhang",
          link: "https://www.linkedin.com/in/jingtang-zhang-b38a76167/",
          icon_light: "icon/linkedin-light.svg",
          icon_dark: "icon/linkedin-dark.svg"
        },
        {
          name: "Weibo",
          login: "肉喇叭叭叭叭",
          link: "https://weibo.com/u/1638054144",
          icon_light: "icon/weibo-light.svg",
          icon_dark: "icon/weibo-dark.svg"
        }
      ],
      friends: [
        {
          name: "Triple-Z",
          avatar: "https://koera.vultr.mrdrivingduck.cn/blog/githubavatar/Triple-Z",
          link: "https://blog.triplez.cn/"
        },
        {
          name: "Lewis-Lu",
          avatar: "https://koera.vultr.mrdrivingduck.cn/blog/githubavatar/Lewis-Lu",
          link: "http://lewissoft.com/"
        },
        {
          name: "zonghuaxiansheng",
          avatar: "https://koera.vultr.mrdrivingduck.cn/blog/githubavatar/zonghuaxiansheng",
          link: "https://github.com/zonghuaxiansheng"
        }
      ],
      teams: [
        {
          name: "NUAA WatchDog",
          avatar: "https://koera.vultr.mrdrivingduck.cn/blog/githubavatar/NUAA-WatchDog",
          link: "https://github.com/NUAA-WatchDog"
        }
      ],
      tgchannel: {
        icon_light: "icon/telegram-light.svg",
        icon_dark: "icon/telegram-dark.svg",
        name: "Subscribe my Telegram channel",
        link: "https://t.me/mrdrivingduck_trumpet",
        login: "Mr Dk.'s Trumpet"
      }
    };
  }
}
</script>