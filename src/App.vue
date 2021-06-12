<!-- 

  @author - Mr Dk.
  @version - 2021/04/03

  @description - 
    The entry component.

-->

<template>
  <div id="app" ref="rootDiv">

    <!-- Back to top -->
    <el-backtop v-bind:style="{ backgroundColor: this.backTopColor }"/>

    <!-- Header -->
    <el-header>
      <duckling-header :theme="theme"></duckling-header>
    </el-header>

    <!-- Central part -->
    <el-container>

      <!-- Aside on the left -->
      <el-aside width=27%>
        <duckling-aside :theme="theme"></duckling-aside>
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
  body {
    font-family: "Microsoft YaHei","PingFang SC",Arial,"Helvetica Neue",Helvetica,"Hiragino Sans GB","微软雅黑",sans-serif;
  }
</style>

<style>
  .dark .el-loading-mask {
    background-color:  #282c34
  }
  .light .el-loading-mask {
    background-color:  #ffffff
  }
  .dark .el-progress-bar__outer {
    background-color: #3b3b3b
  }
  .light .el-progress-bar__outer {
    background-color: #ebeef5;
  }
  .content {
    margin-left: 45px;
    margin-right: 45px;
  }

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
  name: 'app',
  components: {
    DucklingHeader: () => import("./components/DucklingHeader"),
    DucklingAside: () => import("./components/DucklingAside"),
    DucklingContent: () => import("./components/DucklingContent"),
    DucklingFooter: () => import("./components/DucklingFooter")
  },
  data() {
    return {
      theme: null,
      backTopColor: null,
    };
  },
  methods: {

    // Set the theme in props
    setTheme() {
      const allThemes = this.$store.state.theme.themes;
      const themeIndex = this.$store.state.theme.currentThemeIndex;
      this.theme = allThemes[themeIndex].name.toLowerCase();
      this.backTopColor = allThemes[themeIndex].backTopColor;
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
