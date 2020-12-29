<!-- 

  @author - Mr Dk.
  @version - 2020/12/29

  @description - 
    The aside component for guiding.

-->

<template>
  <div>
    
    <!-- The menu on the left -->
    <el-menu
      v-if="!fail"
      v-loading="loading"
      :class="theme"
      :default-openeds="[]"
      :background-color="this.backgroundColor"
      :text-color="this.textColor"
      :active-text-color="this.activeTextColor">

      <aside-home-page :index="1"></aside-home-page>

      <aside-index :index="2"></aside-index>

      <!-- Sub-menu of notes -->
      <aside-notes
        :index="3"
        :directory="asideData['notes']"
      ></aside-notes>

      <!-- Sub-menu of paper-outline -->
      <aside-paper-outline
        :index="4"
        :directory="asideData['paper_outline']"
      ></aside-paper-outline>

      <!-- Sub-menu of how-linux-works -->
      <aside-how-linux-works :index="5"></aside-how-linux-works>

      <!-- Sub-menu of linux-kernel-comments-notes -->
      <aside-linux-kernel-comments
        :index="6"
        :directory="asideData['linux_kernel_comments_notes']"
      ></aside-linux-kernel-comments>

      <!-- Sub-menu of linux-kernel-development-notes -->
      <aside-linux-kernel-development :index="7"
      ></aside-linux-kernel-development>

      <!-- Sub-menu of μC/OS-II -->
      <aside-miu-cos-two
        :index="8"
        :directory="asideData['uc_os_ii_code_notes']"
      ></aside-miu-cos-two>

      <!-- Sub-menu of JDK source code analysis -->
      <aside-jdk-code-analysis :index="9"></aside-jdk-code-analysis>

      <!-- Sub-menu of Understanding-JVM -->
      <aside-understanding-the-jvm
        :index="10"
        :directory="asideData['understanding_the_jvm']"
      ></aside-understanding-the-jvm>

      <!-- Sub-menu of Redis-Implementation -->
      <aside-redis-implementation
        :index="11"
        :directory="asideData['redis_implementation_notes']"
      ></aside-redis-implementation>

      <!-- Sub-menu of Understanding-Nginx -->
      <aside-understanding-nginx
        :index="12"
        :directory="asideData['understanding_nginx_notes']"
      ></aside-understanding-nginx>

      <!-- Sub-menu of Spring Microservices in Action -->
      <aside-spring-microservices-in-action
        :index="13"
        :directory="asideData['spring_microservices_notes']"
      ></aside-spring-microservices-in-action>

    </el-menu>

    <!-- Loading failure -->
    <el-alert
      v-if="fail"
      title="Loading failed"
      type="error"
      :description="failReason"
      :closable="false"
      show-icon>
    </el-alert>
    
  </div>
</template>

<script>
import AsideHomePage from "./aside/AsideHomePage"
import AsideIndex from "./aside/AsideIndex"
import AsideNotes from "./aside/AsideNotes"
import AsidePaperOutline from "./aside/AsidePaterOutline"
import AsideHowLinuxWorks from "./aside/AsideHowLinuxWorks"
import AsideLinuxKernelComments from "./aside/AsideLinuxKernelComments"
import AsideLinuxKernelDevelopment from "./aside/AsideLinuxKernelDevelopment"
import AsideMiuCosTwo from "./aside/AsideMiuCosTwo"
import AsideJdkCodeAnalysis from "./aside/AsideJdkCodeAnalysis"
import AsideUnderstandingTheJvm from "./aside/AsideUnderstandingTheJVM"
import AsideRedisImplementation from "./aside/AsideRedisImplementation"
import AsideUnderstandingNginx from "./aside/AsideUnderstandingNginx"
import AsideSpringMicroservicesInAction from "./aside/AsideSpringMicroservicesInAction"

export default {
  props: [ "theme" ],
  components: {
    AsideHomePage,
    AsideIndex,
    AsideNotes,
    AsidePaperOutline,
    AsideHowLinuxWorks,
    AsideLinuxKernelComments,
    AsideLinuxKernelDevelopment,
    AsideMiuCosTwo,
    AsideJdkCodeAnalysis,
    AsideUnderstandingTheJvm,
    AsideRedisImplementation,
    AsideUnderstandingNginx,
    AsideSpringMicroservicesInAction
  },
  data() {
    return {
      backgroundColor: null,
      textColor: null,
      activeTextColor: null,

      loading: true,
      fail: true,
      failReason: "",

      asideData: {}
    };
  },
  methods: {

    // For changing theme of menu
    setTheme() {
      const allThemes = this.$store.state.theme.themes;
      const themeIndex = this.$store.state.theme.currentThemeIndex;
      let { backgroundColor, textColor, activeTextColor } = allThemes[themeIndex].aside;
      this.backgroundColor = backgroundColor;
      this.textColor = textColor;
      this.activeTextColor = activeTextColor;
    },

    // Load aside through GitHub API
    loadAside() {
      this.loading = true;
      this.fail = false;
      this.failReason = "";

      const url = this.$store.state.githubapi.apiv4;
      const tokenPart1 = process.env.VUE_APP_GITHUB_API_TOKEN_PART_1;
      const tokenPart2 = process.env.VUE_APP_GITHUB_API_TOKEN_PART_2;
      const token = tokenPart1.concat(tokenPart2);
      const query = this.$store.state.githubapi.query;
      
      this.$http.post(url, { query: query["aside"] }, {
        headers: {
          "Authorization": "bearer " + token
        }
      }).then(response => {
        let originData = response.data.data;

        this.asideData = {};
        for (let key in originData) {
          this.asideData[key] = [];
          for (let i = 0; i < originData[key].object.entries.length; i++) {
            const filter = query[key].dirFilter;
            const name = originData[key].object.entries[i].name;
            const type = originData[key].object.entries[i].type;
            if (filter.test(name) && type === "tree") {
              this.asideData[key].push(originData[key].object.entries[i]);
            }
            const sorter = query[key].sort;
            if (sorter) {
              this.asideData[key].sort(sorter);
            }
          }
        }

        // Loading complete
        this.loading = false;
      }).catch(error => {
        // HTTP failed
        this.fail = true;
        this.failReason = error.message;
      });
    }

  },
  mounted() {
    this.setTheme(); // Initialize the theme
  },
  created() {
    this.loadAside();
  },
  computed: {

    // Listening theme changing
    themeChange() {
      return this.$store.state.theme.currentThemeIndex;
    }

  },
  watch: {

    // Trigger theme changing
    themeChange() {
      this.setTheme();
    }

  }
}
</script>