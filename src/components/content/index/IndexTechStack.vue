<!-- 

  @author - Mr Dk.
  @version - 2020/06/21

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
            v-for="(project, idx) in item.projects"
            :key="idx">
            {{ project.description }}
            <el-link
              type="primary"
              :href="project.link">
              {{ project.name ? " - " + project.name : "" }}
            </el-link>
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

<script>
export default {
  props: [ "theme" ],
  data: function() {
    return {
      stack: [
        {
          language: "C/C++",
          percentage: 40,
          projects: [
            {
              description: "Reading Linux 0.12 kernel source code",
              name: "Linux kernel comments notes",
              link: "https://github.com/mrdrivingduck/linux-kernel-comments-notes"
            },
            {
              description: "R(C++) API of DolphinDB©",
              name: "DolphinDB R-API",
              link: "https://github.com/mrdrivingduck/api-r"
            },
            {
              description: "Programming Ability Test (PAT) of Zhejiang University, 2018.03",
              name: "Score 100"
            },
            {
              description: "Reading μC/OS-II kernel source code",
              name: "μC/OS-II code analysis",
              link: "https://github.com/mrdrivingduck/uc-os-ii-code-notes"
            }
          ]
        },
        {
          language: "Java",
          percentage: 45,
          projects: [
            {
              description: "Some network program",
              name: "kismet Java client",
              link: "https://github.com/mrdrivingduck/kismet-Jclient"
            },
            {
              description: "Small tools for file encryption/decryption",
              name: "File privacy protector",
              link: "https://github.com/mrdrivingduck/file-privacy-protector"
            },
            {
              description: "Utility for quick encryption",
              name: "Encryption machine",
              link: "https://github.com/mrdrivingduck/encryption-machine"
            },
            {
              description: "JDK 8 source code analysis",
              name: "JDK source code analysis",
              link: "https://github.com/mrdrivingduck/jdk-source-code-analysis"
            }
          ]
        },
        {
          language: "JavaScript",
          percentage: 20,
          projects: [
            {
              description: "Node.js / Vue.js"
            }
          ]
        },
        {
          language: "Verilog HDL",
          percentage: 12,
          projects: [
            {
              description: "NSCSCC (Loongson Cup), Summer of 2017",
              name: "MIPS 32-bit 5-stage pipeline CPU",
              link: "https://github.com/mrdrivingduck/mips32-CPU"
            }
          ]
        },
        {
          language: "Python",
          percentage: 10,
          projects: [
            {
              description: "Scripts for analyzing 802.11 beacon frames.",
              name: "IEEE 802.11 beacon frame analysis",
              link: "https://github.com/mrdrivingduck/beacon-frame-analysis"
            }
          ]
        },
        {
          language: "C#",
          percentage: 10,
          projects: [
            {
              description: "Some VSTO tools for Microsoft Office©",
              name: "Office utilities",
              link: "https://github.com/mrdrivingduck/office-utilities"
            }
          ]
        },
        {
          language: "SQL",
          percentage: 20,
          projects: [
            {
              description: "Basic CRUD of several back-end programs"
            }
          ]
        }
      ]
    };
  }
}
</script>