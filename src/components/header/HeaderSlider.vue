<!-- 

  @author - Mr Dk.
  @version - 2020/05/30

  @description - 
    Slider for changing themes.

-->

<template>
  <div>

    <el-slider 
      v-model="theme"
      @change="onThemeChange"
      :marks="marks"
      :max="1"
      :show-tooltip="false"
      show-stops>
    </el-slider>
    
  </div>
</template>

<style>

</style>

<script>

export default {
  name: "HeaderSlider",
  data() {
    return {
      theme: 0,
      marks: null
    };
  },
  methods: {

    initialize() {
      this.marks = {};
      this.theme = this.$store.state.theme.currentThemeIndex;

      let allThemes = this.$store.state.theme.themes;
      for (let i = 0; i < allThemes.length; i++) {
        this.$set(this.marks, i, {
          label: allThemes[i].name,
          style: {
            color: "#9567e4"
          }
        });
        // console.log(allThemes[i].name)
      }
    },

    onThemeChange(themeIndex) {
      this.$store.commit("setCurrentTheme", { themeIndex });
    }

  },
  created() {
    this.initialize();
  },
  computed: {

  },
  watch: {

  }
}
</script>