<!-- 

  @author - Mr Dk.
  @version - 2019/07/27

  @description - 
    The content component for displaying pernal information

-->

<template>
  <div>

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

            <p>🧭 {{ location }}</p>
            <p>📧
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
      <el-menu-item index="1"> Tech. Stack </el-menu-item>
      <el-menu-item index="2"> Social Network </el-menu-item>
      <el-menu-item index="3"> About this Page </el-menu-item>
    </el-menu>

    <component
      style="margin-top: 50px;"
      :theme="theme"
      v-bind:is="tabs[selectedTab]">
    </component>

  </div>
</template>

<style>

</style>

<script>
import IndexAbout from "./index/IndexAbout.vue";
import IndexTechStack from "./index/IndexTechStack.vue";
import IndexSocial from "./index/IndexSocial.vue";
import IndexPageInfo from "./index/IndexPageInfo.vue";

export default {
  name: "ContentIndex",
  props: [ "theme" ],
  components: {
    IndexAbout, IndexTechStack, IndexSocial, IndexPageInfo
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
      tabs: [ "IndexAbout", "IndexTechStack", "IndexSocial", "IndexPageInfo" ],

      // For changing themes
      cardBackgroundColor: null,
      cardTextColor: null,

      backgroundColor: null,
      textColor: null,
      activeTextColor: null
    };
  },
  methods: {

    initializeCardInfo: function () {
      this.loading = true;
      this.fail = false;
      this.failReason = "";

      let url = this.$store.state.githubapi.person;
      this.$http.get(url).then(response => {
        let { name, bio, location, company, login } = response.body;
        this.name = name;
        this.aliase = login;
        this.bio = bio;
        this.location = location;
        this.company = company;

        this.loading = false;
      }, err => {
        // HTTP failed
        this.fail = true;
        this.failReason = "Status: " + err.status;
      });
    },

    setCardTheme: function () {
      const themeIndex = this.$store.state.theme.currentThemeIndex;
      const allThemes = this.$store.state.theme.themes;
      let { backgroundColor, textColor } = allThemes[themeIndex].card;
      this.cardBackgroundColor = backgroundColor;
      this.cardTextColor = textColor;
    },

    setNavTheme: function () {
      const allThemes = this.$store.state.theme.themes;
      const themeIndex = this.$store.state.theme.currentThemeIndex;
      let { backgroundColor, textColor, activeTextColor } = allThemes[themeIndex].aside;
      this.backgroundColor = backgroundColor;
      this.textColor = textColor;
      this.activeTextColor = activeTextColor;
    },

    setTheme: function () {
      this.setCardTheme();
      this.setNavTheme();
    },

    selectIndex: function (key) {
      this.selectedTab = key;
    }

  },
  mounted: function () {
    this.initializeCardInfo();
    this.setTheme();
  },
  computed: {
    
    themeChange: function () {
      return this.$store.state.theme.currentThemeIndex;
    }

  },
  watch: {
    themeChange: function () {
      this.setTheme();
    }
  }
}
</script>

