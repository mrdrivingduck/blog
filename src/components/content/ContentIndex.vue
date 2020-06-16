<!-- 

  @author - Mr Dk.
  @version - 2020/06/16

  @description - 
    The content component for displaying pernal information

-->

<template>
  <div :theme="theme" v-loading="loading">

    <el-row :gutter="24" type="flex" align="middle" justify="center">

      <el-col :span="6">
        <div>
          <el-avatar
            src="avatar.jpg"
            style="width: 200px; height: 200px;">
          </el-avatar>
        </div>
      </el-col>

      <el-col :span="14" :offset="1">
        <div>

          <el-card
            v-if="!fail"
            :style="{ backgroundColor: cardBackgroundColor, color: cardTextColor }">

            <p>
              <b style="font-size: 25px">{{ name }}</b>
              &nbsp;&nbsp;&nbsp;
              @mrdrivingduck
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
      style="margin-top: 30px;"
      >
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
        :loading="loading"
        :fail="fail"
        :deployment="deployData"
        :emotionsDate="emotionsData"
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
  data: function() {
    return {

      // Card info
      name: "",
      bio: "",
      location: "",
      company: "",

      // Public index data
      deployData: null,
      emotionsData: null,

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
    initializeCardInfo: function() {
      this.loading = true;
      this.fail = false;
      this.failReason = "";

      const url = this.$store.state.githubapi.apiv4;
      const tokenPart1 = process.env.VUE_APP_TOKEN_PART_1;
      const tokenPart2 = process.env.VUE_APP_TOKEN_PART_2;
      const token = tokenPart1.concat(tokenPart2);
      let query = this.$store.state.githubapi.query["user"];
      this.$http.post(url, { query }, {
        headers: {
          "Authorization": "bearer " + token
        }
      }).then(response => {
        this.deployData = response.data.data.io.deployments.nodes[0];
        this.emotionsData = response.data.data.emotions.object.entries;
        let { name, bio, location, company } = response.data.data.user;
        this.name = name;
        this.bio = bio;
        this.location = location;
        this.company = company;

        this.loading = false;

      }).catch(error => {
        // HTTP failed
        this.fail = true;
        this.failReason = error.message;
      });
    },

    // Set the theme of personal info card
    setCardTheme: function() {
      const themeIndex = this.$store.state.theme.currentThemeIndex;
      const allThemes = this.$store.state.theme.themes;
      let { backgroundColor, textColor } = allThemes[themeIndex].card;
      this.cardBackgroundColor = backgroundColor;
      this.cardTextColor = textColor;
    },

    // Set the theme of navigation
    setNavigationTheme: function() {
      const allThemes = this.$store.state.theme.themes;
      const themeIndex = this.$store.state.theme.currentThemeIndex;
      let { backgroundColor, textColor, activeTextColor } = allThemes[themeIndex].aside;
      this.backgroundColor = backgroundColor;
      this.textColor = textColor;
      this.activeTextColor = activeTextColor;
    },

    setTheme: function() {
      this.setCardTheme();
      this.setNavigationTheme();
    },

    // For selecting sub-component
    selectIndex: function (key) {
      this.selectedTab = key;
    }

  },
  mounted: function() {
    this.initializeCardInfo();
    this.setTheme();
  },
  computed: {
    
    // Triggered when changing theme
    themeChange: function() {
      return this.$store.state.theme.currentThemeIndex;
    }

  },
  watch: {

    // Triggered to change the theme
    themeChange: function() {
      this.setTheme();
    }
    
  }
}
</script>

