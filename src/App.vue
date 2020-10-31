<!-- 

  @author - Mr Dk.
  @version - 2020/03/02

  @description - 
    The entry component.

-->

<template>
  <div id="app" ref="rootDiv">

    <!-- Back to top -->
    <el-backtop></el-backtop>

    <!-- Header -->
    <el-header>
      <duckling-header></duckling-header>
    </el-header>

    <!-- Central part -->
    <el-container>

      <!-- Aside on the left -->
      <el-aside width=27%>
        <duckling-aside></duckling-aside>
      </el-aside>

      <!-- Content on the right -->
      <el-main width=73% class="content">
        <duckling-content :theme="theme"></duckling-content>
      </el-main>
      
    </el-container>

    <!-- Footer -->
    <el-footer>
      <duckling-footer :theme="theme"></duckling-footer>
    </el-footer>

  </div>
</template>

<style>
  .content {
    margin-left: 45px;
    margin-right: 45px;
  }
</style>

<script>
export default {
  name: 'app',
  components: {
    DucklingHeader: () => import("./components/DucklingHeader"),
    DucklingAside: () => import("./components/DucklingAside"),
    DucklingContent: () => import("./components/DucklingContent"),
    DucklingFooter: () => import("./components/DucklingFooter")
  },
  data() {
    return {
      theme: null
    };
  },
  methods: {

    // Set the theme in props
    setTheme() {
      const allThemes = this.$store.state.theme.themes;
      const themeIndex = this.$store.state.theme.currentThemeIndex;
      this.theme = allThemes[themeIndex].name.toLowerCase();
    },

    // Set the background color of HTML page
    setBackgroundStyle() {
      const allThemes = this.$store.state.theme.themes;
      const themeIndex = this.$store.state.theme.currentThemeIndex;
      // Get DOM of <body> and set the style
      let rootDivDom = this.$refs.rootDiv;
      let bodyDiv = rootDivDom.parentNode;
      bodyDiv.style.background = allThemes[themeIndex].background;
    }

  },
  
  mounted() {
    // Called after DOM is mounted
    this.setTheme();
    this.setBackgroundStyle();
  },
  computed: {

    // Listen for theme index changes
    themeChange() {
      return this.$store.state.theme.currentThemeIndex;
    }

  },
  watch: {

    // Triggered when changing theme
    themeChange() {
      this.setTheme();
      this.setBackgroundStyle();
    }
    
  }
}
</script>
