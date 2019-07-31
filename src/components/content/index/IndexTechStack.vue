<!-- 

  @author - Mr Dk.
  @version - 2019/07/27

  @description - 
    The index component for displaying technology stack

-->

<template>
  <div :class="theme">

    <div
      style="width: 90%;"
      v-for="(item) in stack"
      :key="item.language">

        <!-- Language name -->
        <p style="font-size: 20px;">{{ item.language }}</p>
        <ul>
          <li 
            v-for="project in item.projects"
            :key="project">
            {{ project }}
          </li>
        </ul>

        <!-- Progress bar -->
        <el-progress
          :percentage="item.percentage"
          :stroke-width="24"
          :text-inside="true"
          :show-text="false">
        </el-progress>
    </div>

  </div>
</template>

<style>
  .dark p, .dark li {
    color: #ffffff;
  }
  .light p, .light li {
    color: #000000;
  }
</style>

<script>
export default {
  props: [ "theme" ],
  data: function() {
    return {
      stack: [
        {
          language: "C/C++",
          percentage: 32,
        },
        {
          language: "Java",
          percentage: 40
        },
        {
          language: "Javascript",
          percentage: 28
        },
        {
          language: "Python",
          percentage: 13
        },
        {
          language: "SQL",
          percentage: 25
        },
        {
          language: "Verilog HDL",
          percentage: 16
        },
        {
          language: "R",
          percentage: 10
        }
      ]
    };
  }
}
</script>