<!-- 

  @author - Mr Dk.
  @version - 2021/11/08

  @description - 
    The index component for displaying pernal information

-->

<template>
  <div :class="theme">

    <h1>🍺 Hobby</h1>
    <ul>
      <li><p> 💪 Workout </p></li>
      <li><p> 🚘 Driving </p></li>
      <li><p> 🏸 Badminton </p></li>
      <li><p> 💻 Technology </p></li>
    </ul>
    
    <el-divider></el-divider>

    <h1>📚 Publications</h1>

    <ul>
      <li
        v-for="(publication, index) in publications"
        :key="index">
        <p>
          {{ publication.source }}: 
          <el-link type=primary :href=publication.bibtex> {{ publication.title }} </el-link>
          <b> ({{ publication.level }}) </b>
        </p>
      </li>
    </ul>

    <el-divider></el-divider>

    <h1>🎓 Education</h1>

    <el-timeline>
      <el-timeline-item
        v-for="(edu, index) in educations"
        :key="index"
        placement="top"
        type="primary">

        <h2>{{ edu.time }}</h2>
        <p style="font-size: 20px;">
          {{ edu.school_en }}
          <br>
          {{ edu.school_zh }}
        </p>
        <p style="font-size: 16px;" v-if="edu.college_zh">
          {{ edu.college_en }}
          <br>
          {{ edu.college_zh }}
        </p>
        <p style="font-size: 16px;" v-if="edu.major_zh">
          {{ edu.major_en }} - {{ edu.major_zh }} 
          <i :class="edu.major_icon"></i>
        </p>
        <p style="font-size: 16px;" v-if="edu.academic_zh">
          {{ edu.academic_en }} - {{ edu.academic_zh }}
          <i :class="edu.academic_status"></i>
        </p>
        <p style="font-size: 16px;" v-if="edu.location_zh">
          {{ edu.location_en }} - {{ edu.location_zh }}
        </p>

      </el-timeline-item>
    </el-timeline>

    <el-divider></el-divider>

    <h1>💼 Work</h1>

    <el-timeline>
      <el-timeline-item
        v-for="(work, index) in works"
        :key="index"
        placement="top"
        type="primary">

        <h2>{{ work.time }}</h2>
        <p style="font-size: 20px;">
          {{ work.company_en }}
          <br>
          {{ work.company_zh }}
        </p>
        <p style="font-size: 16px;">
          {{ work.job_en }} - {{ work.job_zh }}
        </p>
        <p style="font-size: 16px;">
          {{ work.location_en }} - {{ work.location_zh }}
        </p>

      </el-timeline-item>
    </el-timeline>

  </div>
</template>

<script>
export default {
  props: ["theme"],
  data() {
    return {
      educations: [
        {
          time: "2019.09 - NOW",
          school_en: "Nanjing University of Aeronautics and Astronautics",
          school_zh: "南京航空航天大学",
          college_en: "College of Computer Science and Technology / College of Artificial Intelligence",
          college_zh: "计算机科学与技术学院 / 人工智能学院",
          major_en: "🔑 Cyberspace Security",
          major_zh: "网络空间安全",
          major_icon: "el-icon-lock",
          academic_en: "👨‍🎓 M.Eng.",
          academic_zh: "工学硕士 在读",
          academic_status: "el-icon-loading",
          location_en: "🚩 Nanjing, Jiangsu, P.R.China",
          location_zh: "江苏省南京市"
        },
        {
          time: "2015.09 - 2019.06",
          school_en: "Nanjing University of Aeronautics and Astronautics",
          school_zh: "南京航空航天大学",
          college_en: "College of Computer Science and Technology / College of Artificial Intelligence",
          college_zh: "计算机科学与技术学院 / 人工智能学院",
          major_en: "🔌 IoT. Engineering",
          major_zh: "物联网工程",
          major_icon: "el-icon-cpu",
          academic_en: "👨‍🎓 B.Eng.",
          academic_zh: "工学学士",
          // academic_status: "el-icon-s-check",
          location_en: "🚩 Nanjing, Jiangsu, P.R.China",
          location_zh: "江苏省南京市"
        },
        {
          time: "2012.09 - 2015.06",
          school_en: "Zhejiang Ningbo High School",
          school_zh: "浙江省宁波中学",
          academic_en: "🧒 Senior H.S.",
          academic_zh: "高级中学",
          location_en: "🚩 Ningbo, Zhejiang, P.R.China",
          location_zh: "浙江省宁波市"
        }
      ],
      works: [
        {
          time: "2021.05 - 2021.09",
          company_en: "Alibaba Cloud Computing Co. Ltd.",
          company_zh: "阿里云计算有限公司",
          job_en: "🖥️ PolarDB DBMS Kernel Engineer (internship)",
          job_zh: "PolarDB 数据库内核工程师 (实习)",
          location_en: "🚩 Hangzhou, Zhejiang, P.R.China",
          location_zh: "浙江省杭州市"
        },
        {
          time: "2018.07 - 2018.08",
          company_en: "DolphinDB, Inc.",
          company_zh: "智臾科技有限公司",
          job_en: "🖥️ Software Engineering (internship)",
          job_zh: "软件工程师 (实习)",
          location_en: "🚩 Hangzhou, Zhejiang, P.R.China",
          location_zh: "浙江省杭州市"
        }
      ],
      publications: [
        {
          source: "ICSME'2021",
          title: "Revisiting Test Cases to Boost Generate-and-Validate Program Repair",
          level: "CCF-B",
          bibtex: "https://scholar.googleusercontent.com/scholar.bib?q=info:QNPxEnKhKbsJ:scholar.google.com/&output=citation&scisdr=CgUNnRP0ELnF9APTU1U:AAGBfm0AAAAAYYjVS1WZgEunDyseOttG8owW0NY73dDT&scisig=AAGBfm0AAAAAYYjVS0Bq6QyNnM2ue3MqTyqhmqwkSR5M&scisf=4&ct=citation&cd=-1&hl=zh-CN&scfhb=1"
        }
      ]
    };
  }
}
</script>

