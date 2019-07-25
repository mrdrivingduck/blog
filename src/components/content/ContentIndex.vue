<!-- 

  @author - Mr Dk.
  @version - 2019/07/25

  @description - 
    The content component for displaying pernal information

-->

<template>
  <div>

    <el-row :gutter="20">

      <el-col :span="6">
        <div>
          <el-avatar
            src="avatar.jpg"
            style="width: 200px; height: 200px;">
          </el-avatar>
        </div>
      </el-col>

      <el-col :span="14">
        <div>
          <el-card
            v-bind:style="{ backgroundColor: cardBackgroundColor, color: cardTextColor }">

            <div style="font-size: 25px">
              <b>Mr Dk.</b>
            </div>

            <el-divider></el-divider>

            <p>A Tiffany-twisted perfectionist. 🍬</p>

            <p><i class="el-icon-check"></i>  🏸 / 💪 / 🚗 / 👨‍💻 </p>
            <p><i class="el-icon-location-outline"></i>  Nanjing, Jiangsu, China </p>
            <p><i class="el-icon-message"></i> 
              <a href="mailto:mrdrivingduck@gmail.com"
                style="color: #0366d6;"> mrdrivingduck@gmail.com</a>
            </p>

          </el-card>
        </div>
      </el-col>
    </el-row>

    <el-tabs
      v-model="selectedTab"
      style="margin-top: 50px;">

      <el-tab-pane label="About Me" name="about">
        
      </el-tab-pane>
      <el-tab-pane label="Tech. Stack" name="techstack">
        
      </el-tab-pane>
      <el-tab-pane label="Social Network" name="social">
        
      </el-tab-pane>
      <el-tab-pane label="About this Page" name="pageinfo">
        
      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<style>

</style>

<script>
export default {
  name: "ContentIndex",
  data: function () {
    return {
      selectedTab: "about",

      cardBackgroundColor: null,
      cardTextColor: null
    };
  },
  methods: {

    initialize: function () {
      this.setCardTheme();
    },

    setCardTheme: function () {
      const themeIndex = this.$store.state.theme.currentThemeIndex;
      const allThemes = this.$store.state.theme.themes;
      let { backgroundColor, textColor } = allThemes[themeIndex].card;
      this.cardBackgroundColor = backgroundColor;
      this.cardTextColor = textColor;
    },

  },
  computed: {
    
    themeChange: function () {
      return this.$store.state.theme.currentThemeIndex;
    }

  },
  watch: {

    themeChange: function () {
      this.setCardTheme();
    }
  }
}
</script>

