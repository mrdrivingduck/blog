<!-- 

  @author - Mr Dk.
  @version - 2020/06/27

  @description - 
    The content component for displaying note list.

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
        :page-count="Math.ceil(notes.length / pageSize)"
        :current-page="currentPage"
        @current-change="handleCurrentChange">
      </el-pagination>

      <!-- Every card for note -->
      <el-card
        v-for="note in notes.slice((currentPage - 1) * pageSize, currentPage * pageSize)"
        :key="note.sha"
        shadow="hover"
        style="margin-bottom: 15px;"
        :style="{ backgroundColor: cardBackgroundColor, color: cardTextColor }">

        <div slot="header">
          <span>
            <b> 📑 {{ note.name }} </b>
          </span>
          <el-button
            style="float: right" type="text"
            @click="clickNote(note)">
            Detail
          </el-button>
        </div>
        <p>
          💾 File size: <b> {{ note.size }} </b> KiB
        </p>
        <!-- <p v-loading="note.loading">
          📅 Last Modification: <b> {{ note.commitLastModification }} </b> by <b> {{ note.committer }} </b>
        </p> -->
        <p>
          🔏 SHA: <b> {{ note.sha }} </b>
        </p>
        <p>
          📌
          <el-link
            type="warning"
            v-clipboard:copy="note.copyLink"
            v-clipboard:success="onCopySuccess"
            v-clipboard:error="onCopyError">
            Copy the link to the clipboard
          </el-link>
        </p>

      </el-card>

      <!-- Divide each page -->
      <el-pagination
        :hide-on-single-page="true"
        style="text-align: center;"
        layout="prev, pager, next"
        :page-count="Math.ceil(notes.length / pageSize)"
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
  name: "ContentNoteList",
  components: { GithubButton },
  props: [ "theme" ],
  data() {
    return  {
      notes: null, // Note array
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
    loadNoteDirectory() {
      this.notes = [];
      this.currentPage = 1;
      this.fail = false;
      this.failReason = "";
      this.loading = true;

      const repo = this.$route.query.repo;
      const path = this.$route.query.path;
      const api = this.$store.state.githubapi.query;
      const url = this.$store.state.githubapi.apiv4;
      const tokenPart1 = process.env.VUE_APP_TOKEN_PART_1;
      const tokenPart2 = process.env.VUE_APP_TOKEN_PART_2;
      const token = tokenPart1.concat(tokenPart2);

      const regExpr = api[repo].fileFilter;
      const sorter = api[repo].sort;
      this.repoLink = api[repo].link;

      let query = api.notelist;
      query = query.replace("<repo>", repo.replace(/_/g, "-"));
      query = query.replace("<path>", path);

      this.$http.post(url, { query }, {
        headers: {
          "Authorization": "bearer " + token
        }
      }).then(response => {
        let originData = response.data.data.repository.object.entries;
        for (let i = 0; i < originData.length; i++) {
          if (regExpr.test(originData[i].name)) {
            this.notes.push({
              name: originData[i].name.replace(".md", ""),
              repo,
              path: path === "" ? originData[i].name : (path + "/" + originData[i].name),
              sha: originData[i].oid,
              size: originData[i].object.byteSize / 1024,
              copyLink: "https://mrdrivingduck.github.io/blog/#/markdown?repo="
                          + repo + "&path=" + (path === "" ?
                                                originData[i].name :
                                                (path + "/" + originData[i].name))
            });
          }
        }

        // Sort all the notes according to the sorter.
        this.notes.sort(sorter);

        // Loading completed.
        this.loading = false;

      }).catch(error => {
        // HTTP failed
        this.fail = true;
        this.failReason = error.message;
      });
    },

    // Jump to the outline detail
    clickNote(note) {
      this.$router.push({
        path: "/markdown",
        query: {
          repo: note.repo,
          path: note.path
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
    this.loadNoteDirectory();
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
      this.loadNoteDirectory();
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