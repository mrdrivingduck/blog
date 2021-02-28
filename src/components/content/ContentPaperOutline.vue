<!-- 

  @author - Mr Dk.
  @version - 2021/02/28

  @description - 
    The content component for displaying paper outlines.

-->

<template>
  <div>

    <!-- Content -->
    <div
      :class="theme"
      v-if="!fail"
      v-loading="loading">

      <el-row :gutter="24" type="flex" align="middle" justify="center">

        <el-col :span="4">
          <div>
            <github-button
              :href="repoLink"
              :data-color-scheme="buttonTheme"
              data-icon="octicon-star"
              data-size="large" data-show-count="true">
              Star
            </github-button>
          </div>
        </el-col>

        <el-col :span="4">
          <div>
            <github-button
              :href="repoLinkFork"
              :data-color-scheme="buttonTheme"
              data-icon="octicon-repo-forked"
              data-size="large" data-show-count="true">
              Fork
            </github-button>
          </div>
        </el-col>

        <el-col :span="4">
          <div>
            <github-button
              :href="repoLinkWatch"
              :data-color-scheme="buttonTheme"
              data-icon="octicon-eye"
              data-size="large" data-show-count="true">
              Watch
            </github-button>
          </div>
        </el-col>

        <el-col :span="4">
          <div>
            <github-button
              :href="repoLinkIssue"
              :data-color-scheme="buttonTheme"
              data-icon="octicon-issue-opened"
              data-size="large" data-show-count="true">
              Issue
            </github-button>
          </div>
        </el-col>

        <el-col :span="4">
          <div>
            <github-button
              href="https://github.com/sponsors/mrdrivingduck"
              :data-color-scheme="buttonTheme"
              data-icon="octicon-heart" data-size="large">
              Sponsor
            </github-button>
          </div>
        </el-col>

      </el-row>

      <el-divider></el-divider>

      <!-- Divide each page -->
      <el-pagination
        :hide-on-single-page="true"
        style="text-align: center;"
        layout="prev, pager, next"
        :page-count="Math.ceil(outlines.length / pageSize)"
        :current-page="currentPage"
        @current-change="handleCurrentChange">
      </el-pagination>

      <!-- Every card for paper outlines -->
      <el-card
        v-for="outline in outlines.slice((currentPage - 1) * pageSize, currentPage * pageSize)"
        :key="outline.sha"
        shadow="hover"
        style="margin-bottom: 15px;"
        v-bind:style="{ backgroundColor: cardBackgroundColor, color: cardTextColor }">

        <div slot="header">
          <span>
            <b> 📑 {{ outline.name }} </b>
          </span>
          <el-button
            style="float: right" type="text"
            @click="clickOutline(outline)">
            Detail
          </el-button>
        </div>
        <div>
          <div v-if="outline.resource">
            <p>
              💾 File size: <b> {{ outline.resource.size }} </b> KiB
            </p>
            <p>
              🔏 SHA: <b> {{ outline.resource.sha }} </b>
            </p>
            <p>
              📌
              <el-link
                type="warning"
                v-clipboard:copy="outline.resource.copyLink"
                v-clipboard:success="onCopySuccess"
                v-clipboard:error="onCopyError">
                Copy the link to the clipboard
              </el-link>
            </p>
          </div>
          <p v-if="outline.pdf ? true : false">
            🖨️
            <el-link :href="outline.pdf.download_url" type="primary">
              Paper download
            </el-link>
          </p>
          <p v-if="outline.slide ? true : false">
            📽️
            <el-link :href="outline.slide.download_url" type="primary">
              Slides download
            </el-link>
          </p>
        </div>

      </el-card>

      <!-- Divide each page -->
      <el-pagination
        :hide-on-single-page="true"
        style="text-align: center;"
        layout="prev, pager, next"
        :page-count="Math.ceil(outlines.length / pageSize)"
        :current-page="currentPage"
        @current-change="handleCurrentChange">
      </el-pagination>
    </div>

    <!-- Load failure -->
    <el-alert
      v-if="fail"
      title="Loading failed"
      type="error"
      :description="failReason"
      :closable="false"
      show-icon>
    </el-alert>
    
  </div>
</template>

<script>
import GithubButton from "vue-github-button";

export default {
  name: "ContentPaperOutline",
  components: { GithubButton },
  props: [ "theme" ],
  data() {
    return  {
      outlines: null, // For outlines in a repository directory
      loading: true, // For displaying loading status
      fail: false, // Set to true if loading error occurs
      failReason: "", // Reason of failure

      // Theme of the card
      cardBackgroundColor: null,
      cardTextColor: null,

      // For paging
      currentPage: 1,
      pageSize: 6,

      repoLink: "",
      buttonTheme: "no-preference: light; light: dark; dark: light;"
    };
  },
  methods: {

    // Load one of the outline topic
    loadOutlineDirectory(url) {
      const repo = this.$route.query.repo;
      const path = this.$route.query.path;

      this.outlines = [];
      this.fail = false;
      this.failReason = "";
      this.loading = true;

      const api = this.$store.state.githubapi.query;
      const tokenPart1 = process.env.VUE_APP_GITHUB_API_TOKEN_PART_1;
      const tokenPart2 = process.env.VUE_APP_GITHUB_API_TOKEN_PART_2;
      const token = tokenPart1.concat(tokenPart2);

      const regExpr = api[repo].fileFilter;
      const branch = api[repo].branch;
      const pdfFormatReg = this.$store.state.regexpre.pdfFormatReg;
      const pptFormatReg = this.$store.state.regexpre.pptFormatReg;

      this.repoLink = api[repo].link;

      let query = api.outline_list;
      query = query.replace("<repo>", repo.replace(/_/g, "-"));
      query = query.replace("<branch>", branch);
      query = query.replace("<path>", path);

      this.$http.post(url, { query }, {
        headers: {
          "Authorization": "bearer " + token
        }
      }).then(response => {
        let originData = response.data.data.repository.object.entries;
        for (let i = 0; i < originData.length; i++) {
          this.outlines.push({
            name: originData[i].name.replace(" -", ":"),
            path: path + "/" + originData[i].name,
            repo: repo
          });
          for (let j = 0; j < originData[i].object.entries.length; j++) {
            if (regExpr.test(originData[i].object.entries[j].name)) {
              this.$set(this.outlines[i], "resource", {
                sha: originData[i].object.entries[j].oid,
                path: this.outlines[i].path + "/" + originData[i].object.entries[j].name,
                size: originData[i].object.entries[j].object.byteSize / 1024,
                copyLink: "https://mrdrivingduck.github.io/blog/#/markdown?repo="
                            + repo + "&path=" + this.outlines[i].path + "/"
                            + originData[i].object.entries[j].name
              });
            } else if (pdfFormatReg.test(originData[i].object.entries[j].name)) {
              this.$set(this.outlines[i], "pdf", {
                download_url: "https://raw.githubusercontent.com/mrdrivingduck/paper-outline/master/" +
                              this.outlines[i].path + "/" + originData[i].object.entries[j].name
              });
            } else if (pptFormatReg.test(originData[i].object.entries[j].name)) {
              this.$set(this.outlines[i], "slide", {
                download_url: "https://raw.githubusercontent.com/mrdrivingduck/paper-outline/master/" +
                              this.outlines[i].path + "/" + originData[i].object.entries[j].name
              });
            }
          }
        }

        // Loading completed.
        this.loading = false;

      }).catch(error => {
        // HTTP failed
        const fallbackUrl = this.$store.state.githubapi.apiv4Fallback;
        if (url === fallbackUrl) {
          this.fail = true;
          this.failReason = error.message;
        } else {
          this.loadOutlineDirectory(fallbackUrl);
        }
      });

    },

    // Jump to the outline detail
    clickOutline(outline) {
      this.$router.push({
        path: "/markdown",
        query: {
          repo: outline.repo,
          path: outline.resource.path
        }
      }).catch(err => { err });
    },

    // Set the background color and text color of the cards
    setCardTheme() {
      const themeIndex = this.$store.state.theme.currentThemeIndex;
      const allThemes = this.$store.state.theme.themes;
      let { backgroundColor, textColor } = allThemes[themeIndex].card;
      this.cardBackgroundColor = backgroundColor;
      this.cardTextColor = textColor;
      this.buttonTheme = allThemes[themeIndex].buttonStyle;
    },

    // For changing the current-page variable
    handleCurrentChange(currentPage) {
      this.currentPage = currentPage;
    },

    // For copying links hint (success)
    onCopySuccess() {
      this.$notify({
        title: "Copy successfully 😁",
        message: "The link is on your clipboard.",
        type: "success"
      });
    },

    // For copying links hint (failed)
    onCopyError() {
      this.$notify({
        title: "Copy failed 😥",
        message: "There might be a BUG.",
        type: "error"
      });
    }

  },
  created() {
    // Initializing the data from GitHub
    const url = this.$store.state.githubapi.apiv4;
    this.loadOutlineDirectory(url);
    this.setCardTheme();
  },
  computed: {

    // Listening for the theme changed
    themeChange() {
      return this.$store.state.theme.currentThemeIndex;
    },

    repoLinkFork() {
      return this.repoLink + "/fork"
    },

    repoLinkWatch() {
      return this.repoLink + "/subscription"
    },

    repoLinkIssue() {
      return this.repoLink + "/issues"
    }

  },
  watch: {

    // Set the theme of the card
    themeChange() {
      this.setCardTheme();
    },

    $route() {
      const url = this.$store.state.githubapi.apiv4;
      this.loadOutlineDirectory(url);
    }

  }
}
</script>

<style>
  /* Transparent background */
  .el-pager li,
  .el-pagination .btn-next,
  .el-pagination .btn-prev,
  .el-pagination button:disabled {
    background: #ffffff00;
  }

  .dark .el-pager li.active,
  .dark .el-pager li:hover,
  .dark .el-pagination button:hover {
    color: #ffd04b;
  }
  .dark .el-pager li,
  .dark .el-pagination button:enabled {
    color: #ffffff;
  }
  .dark .el-pagination button:disabled {
    color: #707275;
  }

  .light .el-pager li.active,
  .light .el-pager li:hover,
  .light .el-pagination button:hover {
    color: #9567e4;
  }
</style>