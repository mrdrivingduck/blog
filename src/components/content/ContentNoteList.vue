<!-- 

  @author - Mr Dk.
  @version - 2020/03/01

  @description - 
    The content component for displaying note list

-->

<template>
  <div>

    <!-- Content -->
    <div
      :class="theme"
      v-if="!fail"
      v-loading="loading">

      <!-- Divide each page -->
      <el-pagination
        v-if="Math.ceil(notes.length / pageSize) > 1"
        style="text-align: center;"
        layout="prev, pager, next"
        :page-count="Math.ceil(notes.length / pageSize)"
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
        v-if="Math.ceil(notes.length / pageSize) > 1"
        style="text-align: center;"
        layout="prev, pager, next"
        :page-count="Math.ceil(notes.length / pageSize)"
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
export default {
  name: "ContentNoteList",
  props: [ "theme" ],
  data: function() {
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
      pageSize: 6
    };
  },
  methods: {

    // Load one of the outline topic
    loadNoteDirectory: function() {
      this.notes = [];
      this.currentPage = 1;
      this.fail = false;
      this.failReason = "";
      this.loading = true;

      const repo = this.$route.query.repo;
      const path = this.$route.query.path;
      const api = this.$store.state.githubapi.query;
      const url = this.$store.state.githubapi.apiv4;
      const token = this.$store.state.githubapi.pat;

      const regExpr = api[repo].fileFilter;
      const sorter = api[repo].sort;

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
              copyLink: "https://mrdrivingduck.github.io/#/markdown?repo="
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
    clickNote: function (note) {
      this.$router.push({
        path: "/markdown",
        query: {
          repo: note.repo,
          path: note.path
        }
      }).catch(err => { err });
    },

    // Set the background color and text color of the cards
    setCardTheme: function() {
      const themeIndex = this.$store.state.theme.currentThemeIndex;
      const allThemes = this.$store.state.theme.themes;
      let { backgroundColor, textColor } = allThemes[themeIndex].card;
      this.cardBackgroundColor = backgroundColor;
      this.cardTextColor = textColor;
    },

    // For changing the current-page variable
    handleCurrentChange: function (currentPage) {
      this.currentPage = currentPage;
    },

    // For copying links hint (success)
    onCopySuccess: function() {
      this.$notify({
        title: "Copy successfully 😁",
        message: "The link is on your clipboard.",
        type: "success"
      });
    },

    // For copying links hint (failed)
    onCopyError: function() {
      this.$notify({
        title: "Copy failed 😥",
        message: "There might be a BUG.",
        type: "error"
      });
    }

  },
  created: function() {
    // Initializing the data from GitHub
    this.loadNoteDirectory();
    this.setCardTheme();
  },
  computed: {

    // Listening for the theme changed
    themeChange: function() {
      return this.$store.state.theme.currentThemeIndex;
    }

  },
  watch: {

    // Set the theme of the card
    themeChange: function() {
      this.setCardTheme();
    },

    $route: function() {
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