<!-- 

  @author - Mr Dk.
  @version - 2020/07/03

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
              description: "🐧 Kernel module for signature verification of ELF files.",
              name: "ELF sig-verify module",
              // link: "https://github.com/mrdrivingduck/linux-kernel-elf-sig-verify-module"
            },
            {
              description: "🐧 Adding digital signature into ELF binary files.",
              name: "Linux ELF binary signer",
              // link: "https://github.com/mrdrivingduck/linux-elf-binary-signer"
            },
            {
              description: "🐧 Notes of reading Linux kernel source code.",
              name: "Linux kernel comments notes",
              link: "https://github.com/mrdrivingduck/linux-kernel-comments-notes"
            },
            {
              description: "🐤 Notes of reading μC/OS-II code.",
              name: "μC/OS-II code analysis",
              link: "https://github.com/mrdrivingduck/uc-os-ii-code-notes"
            },
            {
              description: "🐬 R(C++)-API of DolphinDB server.",
              name: "DolphinDB R-API",
              link: "https://github.com/mrdrivingduck/api-r"
            },
            {
              description: "Programming Ability Test (PAT) of Zhejiang University, 2018.03",
              name: "Score 100"
            }
          ]
        },
        {
          language: "Java",
          percentage: 45,
          projects: [
            {
              description: "☕ Notes of reading JDK 8 source code.",
              name: "JDK source code analysis",
              link: "https://github.com/mrdrivingduck/jdk-source-code-analysis"
            },
            {
              description: "🌉 A Java client for Kismet RESTful API.",
              name: "kismet Java client",
              link: "https://github.com/mrdrivingduck/kismet-Jclient"
            },
            {
              description: "🤐 Code for file encryption/decryption.",
              name: "File privacy protector",
              link: "https://github.com/mrdrivingduck/file-privacy-protector"
            },
            {
              description: "🔒 A Java wrapper for simple encryption/decryption.",
              name: "Encryption machine",
              link: "https://github.com/mrdrivingduck/encryption-machine"
            }
          ]
        },
        {
          language: "JavaScript (Node.js / Vue.js)",
          percentage: 20,
          projects: [
            {
              description: "🦆 Dynamic blog system based on Vue.js.",
              name: "blog",
              link: "https://github.com/mrdrivingduck/blog"
            }
          ]
        },
        {
          language: "Verilog HDL",
          percentage: 12,
          projects: [
            {
              description: "🔌 A 32-bit MIPS CPU supporting 57 instructions for NSCSCC (Loongson Cup), Summer of 2017.",
              name: "mips32-CPU",
              link: "https://github.com/mrdrivingduck/mips32-CPU"
            }
          ]
        },
        {
          language: "Python",
          percentage: 10,
          projects: [
            {
              description: "🐌 Scripts for analyzing 802.11 beacon frames.",
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
              description: "⚙️ Tools for automatic jobs with MS Office.",
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