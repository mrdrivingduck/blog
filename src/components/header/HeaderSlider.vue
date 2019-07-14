<!-- 

  @author - Mr Dk.
  @version - 2019/07/14

  @description - 
    Slider for changing themes.

-->

<template>
  <div>

    <el-slider 
      v-model="theme"
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
  data: function () {
    return  {
      theme: 0,
      marks: {
        0: "Light",
        1: "Dark"
      }
    };
  },
  methods: {

    initialize: function () {
      this.marks = {};
      this.theme = this.$store.state.theme.currentThemeIndex;
      let allThemes = this.$store.state.theme.themes;

      for (let i = 0; i < allThemes.length; i++) {
        this.$set(this.marks, i, allThemes[i].name);
      }
      
    }

  },
  created: function () {
    this.initialize();
  },
  computed: {

  },
  watch: {

  }
}
</script>