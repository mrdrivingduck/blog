<!-- 

  @author - Mr Dk.
  @version - 2020/04/13

  @description - 
    The aside component for guiding.

-->

<template>
  <div>
    
    <!-- The menu on the left -->
    <el-menu
      v-if="!fail"
      v-loading="loading"
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

      <!-- Sub-menu of JDK source code analysis -->
      <aside-understanding-the-jvm
        :index="10"
        :directory="asideData['understanding_the_jvm']"
      ></aside-understanding-the-jvm>

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
export default {
  components: {
    AsideHomePage: () => import("./aside/AsideHomePage"),
    AsideIndex: () => import("./aside/AsideIndex"),
    AsideNotes: () => import("./aside/AsideNotes"),
    AsidePaperOutline: () => import("./aside/AsidePaterOutline"),
    AsideHowLinuxWorks: () => import("./aside/AsideHowLinuxWorks"),
    AsideLinuxKernelComments: () => import("./aside/AsideLinuxKernelComments"),
    AsideLinuxKernelDevelopment: () => import("./aside/AsideLinuxKernelDevelopment"),
    AsideMiuCosTwo: () => import("./aside/AsideMiuCosTwo"),
    AsideJdkCodeAnalysis: () => import("./aside/AsideJdkCodeAnalysis"),
    AsideUnderstandingTheJvm: () => import("./aside/AsideUnderstandingTheJVM")
  },
  data: function() {
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
    setTheme: function() {
      const allThemes = this.$store.state.theme.themes;
      const themeIndex = this.$store.state.theme.currentThemeIndex;
      let { backgroundColor, textColor, activeTextColor } = allThemes[themeIndex].aside;
      this.backgroundColor = backgroundColor;
      this.textColor = textColor;
      this.activeTextColor = activeTextColor;
    },

    // Load aside through GitHub API
    loadAside: function() {
      this.loading = true;
      this.fail = false;
      this.failReason = "";

      const url = this.$store.state.githubapi.apiv4;
      const tokenPart1 = this.$store.state.githubapi.patPart1;
      const tokenPart2 = this.$store.state.githubapi.patPart2;
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
  mounted: function() {
    this.setTheme(); // Initialize the theme
  },
  created: function() {
    this.loadAside();
  },
  computed: {

    // Listening theme changing
    themeChange: function() {
      return this.$store.state.theme.currentThemeIndex;
    }

  },
  watch: {

    // Trigger theme changing
    themeChange: function() {
      this.setTheme();
    }

  }
}
</script>