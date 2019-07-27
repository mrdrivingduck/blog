<!-- 

  @author - Mr Dk.
  @version - 2019/07/27

  @description - 
    The aside component for guiding

-->

<template>
  <div>
    
    <!-- The menu on the left -->
    <el-menu
      :default-openeds="['2']"
      :background-color="this.backgroundColor"
      :text-color="this.textColor"
      :active-text-color="this.activeTextColor">

      <!-- Sub-menu of notes -->
      <aside-notes :index="1"></aside-notes>

      <!-- Sub-menu of paper-outline -->
      <aside-paper-outline :index="2"></aside-paper-outline>

    </el-menu>
    
  </div>
</template>

<style>

</style>

<script>
import AsideNotes from "./aside/AsideNotes.vue";
import AsidePaperOutline from "./aside/AsidePaterOutline.vue";

export default {
  components: {
    AsideNotes,
    AsidePaperOutline
  },
  data: function() {
    return {
      backgroundColor: null,
      textColor: null,
      activeTextColor: null
    };
  },
  methods: {

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