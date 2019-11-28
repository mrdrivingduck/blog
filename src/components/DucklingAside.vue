<!-- 

  @author - Mr Dk.
  @version - 2019/11/29

  @description - 
    The aside component for guiding

-->

<template>
  <div>
    
    <!-- The menu on the left -->
    <el-menu
      :default-openeds="[]"
      :background-color="this.backgroundColor"
      :text-color="this.textColor"
      :active-text-color="this.activeTextColor">

      <aside-home :index="1"></aside-home>

      <!-- Sub-menu of notes -->
      <aside-notes :index="2"></aside-notes>

      <!-- Sub-menu of paper-outline -->
      <aside-paper-outline :index="3"></aside-paper-outline>

      <!-- Sub-menu of how-linux-works -->
      <aside-how-linux-works :index="4"></aside-how-linux-works>

      <!-- Sub-menu of linux-kernel-comments-notes -->
      <aside-linux-kernel-comments :index="5"></aside-linux-kernel-comments>

      <!-- Sub-menu of linux-kernel-development-notes -->
      <aside-linux-kernel-development :index="6"></aside-linux-kernel-development>

      <!-- Sub-menu of μC/OS-II -->
      <aside-miu-cos-two :index="7"></aside-miu-cos-two>

      <!-- Sub-menu of JDK source code analysis -->
      <aside-jdk-code-analysis :index="8"></aside-jdk-code-analysis>

    </el-menu>
    
  </div>
</template>

<script>
export default {
  components: {
    AsideHome: () => import("./aside/AsideHome"),
    AsideNotes: () => import("./aside/AsideNotes"),
    AsidePaperOutline: () => import("./aside/AsidePaterOutline"),
    AsideHowLinuxWorks: () => import("./aside/AsideHowLinuxWorks"),
    AsideLinuxKernelComments: () => import("./aside/AsideLinuxKernelComments"),
    AsideLinuxKernelDevelopment: () => import("./aside/AsideLinuxKernelDevelopment"),
    AsideMiuCosTwo: () => import("./aside/AsideMiuCosTwo"),
    AsideJdkCodeAnalysis: () => import("./aside/AsideJdkCodeAnalysis")
  },
  data: function() {
    return {
      backgroundColor: null,
      textColor: null,
      activeTextColor: null
    };
  },
  methods: {

    // For changing theme of menu
    setTheme: function () {
      const allThemes = this.$store.state.theme.themes;
      const themeIndex = this.$store.state.theme.currentThemeIndex;
      let { backgroundColor, textColor, activeTextColor } = allThemes[themeIndex].aside;
      this.backgroundColor = backgroundColor;
      this.textColor = textColor;
      this.activeTextColor = activeTextColor;
    }

  },
  mounted: function () {
    this.setTheme(); // Initialize the theme
  },
  computed: {

    // Listening theme changing
    themeChange: function () {
      return this.$store.state.theme.currentThemeIndex;
    }

  },
  watch: {

    // Trigger theme changing
    themeChange: function () {
      this.setTheme();
    }

  }
}
</script>