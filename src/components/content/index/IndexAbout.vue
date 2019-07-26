<!-- 

  @author - Mr Dk.
  @version - 2019/07/26

  @description - 
    The index component for displaying pernal information

-->

<template>
  <div class="dark">

    <h1><i class="el-icon-school"></i>Education</h1>

    <el-timeline>
      <el-timeline-item
        v-for="(edu, index) in educations"
        :key="index"
        placement="top"
        type="primary">

        <h2>{{ edu.time }}</h2>
        <p style="font-size: 20px;">
          {{ edu.university_en }}
          <br>
          {{ edu.university_zh }}
        </p>
        <p style="font-size: 16px;">
          {{ edu.college_en }}
          <br>
          {{ edu.college_zh }}
        </p>
        <p style="font-size: 16px;">
          {{ edu.major_en }} - {{ edu.major_zh }} 
          <i :class="edu.major_icon"></i>
        </p>
        <p style="font-size: 16px;">
          {{ edu.academic_en }} - {{ edu.academic_zh }}
          <i :class="edu.academic_status"></i>
        </p>
        <p style="font-size: 16px;">
          {{ edu.location_en }} - {{ edu.location_zh }}
        </p>

      </el-timeline-item>
    </el-timeline>

  </div>
</template>

<style>
  .dark h1, h2, p {
    color: #ffffff;
  }
  .light h1, h2, p {
    color: #000000;
  }
</style>

<script>
export default {
  data: function () {
    return {
      educations: [
        {
          time: "2019.09 - NOW",
          university_en: "Nanjing University of Aeronautics and Astronautics",
          university_zh: "南京航空航天大学",
          college_en: "College of Computer Science and Technology / College of Artificial Intelligence",
          college_zh: "计算机科学与技术学院 / 人工智能学院",
          major_en: "🔑 Cyberspace Security",
          major_zh: "网络空间安全",
          major_icon: "el-icon-lock",
          academic_en: "👨‍🎓 M.Eng",
          academic_zh: "工学硕士 在读",
          academic_status: "el-icon-loading",
          location_en: "🚩 Nanjing, Jiangsu, China",
          location_zh: "江苏省南京市"
        },
        {
          time: "2015.09 - 2019.06",
          university_en: "Nanjing University of Aeronautics and Astronautics",
          university_zh: "南京航空航天大学",
          college_en: "College of Computer Science and Technology / College of Artificial Intelligence",
          college_zh: "计算机科学与技术学院 / 人工智能学院",
          major_en: "🔌 IoT. Engineering",
          major_zh: "物联网工程",
          major_icon: "el-icon-cpu",
          academic_en: "👨‍🎓 B.Eng",
          academic_zh: "工学学士学位",
          // academic_status: "el-icon-s-check",
          location_en: "🚩 Nanjing, Jiangsu, China",
          location_zh: "江苏省南京市"
        }
      ]
    };
  },
  methods: {
    
    setTheme: function () {
      // const themeIndex = this.$store.state.theme.currentThemeIndex;
      // const allThemes = this.$store.state.theme.themes;
      // let { backgroundColor, textColor } = allThemes[themeIndex].card;
      // this.cardBackgroundColor = backgroundColor;
      // this.cardTextColor = textColor;
    }

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

