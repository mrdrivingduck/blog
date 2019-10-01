<!-- 

  @author - Mr Dk.
  @version - 2019/10/01

  @description - 
    The aside component for guiding

-->

<template>
  <div>
    
    <!-- The menu on the left -->
    <el-menu
      :default-openeds="['2','4']"
      :background-color="this.backgroundColor"
      :text-color="this.textColor"
      :active-text-color="this.activeTextColor">

      <!-- Sub-menu of notes -->
      <aside-notes :index="1"></aside-notes>

      <!-- Sub-menu of paper-outline -->
      <aside-paper-outline :index="2"></aside-paper-outline>

      <!-- Sub-menu of how-linux-works -->
      <aside-how-linux-works :index="3"></aside-how-linux-works>

      <!-- Sub-menu of linux-kernel-comments-notes -->
      <aside-linux-kernel-comments :index="4"></aside-linux-kernel-comments>

    </el-menu>
    
  </div>
</template>

<script>
export default {
  components: {
    AsideNotes: () => import("./aside/AsideNotes"),
    AsidePaperOutline: () => import("./aside/AsidePaterOutline"),
    AsideHowLinuxWorks: () => import("./aside/AsideHowLinuxWorks"),
    AsideLinuxKernelComments: () => import("./aside/AsideLinuxKernelComments")
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