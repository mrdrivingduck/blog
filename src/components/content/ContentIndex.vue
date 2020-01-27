<!-- 

  @author - Mr Dk.
  @version - 2020/01/26

  @description - 
    The content component for displaying pernal information

-->

<template>
  <div :theme="theme">

    <el-row :gutter="20">

      <el-col :span="6">
        <div>
          <el-avatar
            src="avatar.jpg"
            style="width: 200px; height: 200px;">
          </el-avatar>
        </div>
      </el-col>

      <el-col :span="14">
        <div>

          <el-card
            v-loading="loading"
            v-if="!fail"
            :style="{ backgroundColor: cardBackgroundColor, color: cardTextColor }">

            <p>
              <b style="font-size: 25px">{{ name }}</b>
              &nbsp;&nbsp;&nbsp;
              @{{ aliase }}
            </p>

            <el-divider></el-divider>

            <p>{{ bio }}</p>

            <p>📌 {{ location }}</p>
            <p>📭
              <el-link
                type="primary"
                href="mailto:mrdrivingduck@gmail.com">
                mrdrivingduck@gmail.com
              </el-link>
            </p>

          </el-card>

          <el-alert
            v-if="fail"
            title="Loading failed"
            type="error"
            :description="failReason"
            :closable="false"
            show-icon>
          </el-alert>

        </div>
      </el-col>
    </el-row>

    <el-menu
      mode="horizontal"
      :default-active="defaultTab"
      :background-color="this.backgroundColor"
      :text-color="this.textColor"
      :active-text-color="this.activeTextColor"
      @select="selectIndex"
      style="margin-top: 30px;">
      <el-menu-item index="0"> About Me </el-menu-item>
      <el-menu-item index="1"> Emotions </el-menu-item>
      <el-menu-item index="2"> Tech. Stack </el-menu-item>
      <el-menu-item index="3"> Links </el-menu-item>
      <el-menu-item index="4"> About this Blog </el-menu-item>
    </el-menu>

    <keep-alive>
      <component
        style="margin-top: 50px;"
        :theme="theme"
        v-bind:is="tabs[selectedTab]">
      </component>
    </keep-alive>

  </div>
</template>

<style>
  .dark h1, .dark h2, .dark p, .dark li {
    color: #ffffff;
  }
  .dark h1 {
    margin-top: 50px;
  }
  .light h1, .light h2, .light p, .light li {
    color: #000000;
  }
  .light h1 {
    margin-top: 50px;
  }
</style>

<script>
export default {
  name: "ContentIndex",
  props: [ "theme" ],
  components: {
    IndexEmotion: () => import("./index/IndexEmotion"),
    IndexAbout: () => import("./index/IndexAbout"),
    IndexTechStack: () => import("./index/IndexTechStack"),
    IndexLinks: () => import("./index/IndexLinks"),
    IndexPageInfo: () => import("./index/IndexPageInfo")
  },
  data: function () {
    return {

      // Card info
      name: "",
      aliase: "",
      bio: "",
      location: "",
      company: "",

      // Network status
      loading: true,
      fail: false,
      failReason: "",

      // Bottom components selector
      defaultTab: "0",
      selectedTab: 0,
      tabs: [ "IndexAbout", "IndexEmotion", "IndexTechStack", "IndexLinks", "IndexPageInfo" ],

      // For changing themes
      cardBackgroundColor: null,
      cardTextColor: null,
      // Navigation
      backgroundColor: null,
      textColor: null,
      activeTextColor: null
    };
  },
  methods: {

    // For initializing personal info card
    initializeCardInfo: function () {
      this.loading = true;
      this.fail = false;
      this.failReason = "";

      let url = this.$store.state.githubapi.api["user"].content;
      this.$http.get(url).then(response => {
        let { name, bio, location, company, login } = response.data;
        this.name = name;
        this.aliase = login;
        this.bio = bio;
        this.location = location;
        this.company = company;
        // Loading complete
        this.loading = false;

      }).catch(error => {
        // HTTP failed
        this.fail = true;
        this.failReason = error.message;
      });
    },

    // Set the theme of personal info card
    setCardTheme: function () {
      const themeIndex = this.$store.state.theme.currentThemeIndex;
      const allThemes = this.$store.state.theme.themes;
      let { backgroundColor, textColor } = allThemes[themeIndex].card;
      this.cardBackgroundColor = backgroundColor;
      this.cardTextColor = textColor;
    },

    // Set the theme of navigation
    setNavigationTheme: function () {
      const allThemes = this.$store.state.theme.themes;
      const themeIndex = this.$store.state.theme.currentThemeIndex;
      let { backgroundColor, textColor, activeTextColor } = allThemes[themeIndex].aside;
      this.backgroundColor = backgroundColor;
      this.textColor = textColor;
      this.activeTextColor = activeTextColor;
    },

    setTheme: function () {
      this.setCardTheme();
      this.setNavigationTheme();
    },

    // For selecting sub-component
    selectIndex: function (key) {
      this.selectedTab = key;
    }

  },
  mounted: function () {
    this.initializeCardInfo();
    this.setTheme();
  },
  computed: {
    
    // Triggered when changing theme
    themeChange: function () {
      return this.$store.state.theme.currentThemeIndex;
    }

  },
  watch: {

    // Triggered to change the theme
    themeChange: function () {
      this.setTheme();
    }
    
  }
}
</script>

