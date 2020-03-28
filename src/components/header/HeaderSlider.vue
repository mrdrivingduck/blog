<!-- 

  @author - Mr Dk.
  @version - 2020/03/28

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
  data: function() {
    return  {
      theme: 0,
      marks: null
    };
  },
  methods: {

    initialize: function() {
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
        console.log(allThemes[i].name)
      }
    },

    onThemeChange: function (themeIndex) {
      this.$store.commit("setCurrentTheme", { themeIndex });
    }

  },
  created: function() {
    this.initialize();
  },
  computed: {

  },
  watch: {

  }
}
</script>