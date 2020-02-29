<!-- 

  @author - Mr Dk.
  @version - 2020/02/07

  @description - 
    The content component for displaying paper outlines

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
        v-if="Math.ceil(outlines.length / pageSize) > 1"
        style="text-align: center;"
        layout="prev, pager, next"
        :page-count="Math.ceil(outlines.length / pageSize)"
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
            @click="clickOutline(outline.resource)">
            Detail
          </el-button>
        </div>
        <div v-loading="outline.loading">
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
            <p>
              🖨️
              <el-link :href="outline.pdf.download_url" type="primary">
                Paper download </el-link>
            </p>
            <p v-if="outline.slide ? true : false" v-loading="outline.loading">
              📽️ <el-link :href="outline.slide.download_url" type="primary"> Slides download </el-link>
            </p>
          </div>
        </div>

      </el-card>

      <!-- Divide each page -->
      <el-pagination
        v-if="Math.ceil(outlines.length / pageSize) > 1"
        style="text-align: center;"
        layout="prev, pager, next"
        :page-count="Math.ceil(outlines.length / pageSize)"
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
  name: "ContentPaperOutline",
  props: [ "theme" ],
  data: function() {
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
      pageSize: 6
    };
  },
  methods: {

    // Load one of the outline topic
    loadOutlineDirectory: function() {
      const repo = this.$route.query.repo;
      const path = this.$route.query.path;
      // Get topic URL
      const url = this.$store.state.githubapi.api[repo].content + path;
      // Initialize component status
      this.outlines = [];
      this.fail = false;
      this.failReason = "";
      this.loading = true;
      // Issue HTTP request
      this.$http.get(url).then(response => {
        for (let i = 0; i < response.data.length; i++) {
          let { url, name, path } = response.data[i];
          name = name.replace(" -", ":");
          this.outlines.push({ url, name, path });
          this.loadOutlineUrl(this.outlines[i], repo);
        }
        // All directories in a topic load complete
        this.loading = false;
        
      }).catch(error => {
        // HTTP failure
        this.fail = true;
        this.failReason = error.message;
      });
    },

    // Load outline file metadata in a directory
    loadOutlineUrl: function (dirObj, repo) {
      // Set loading status of metadata
      this.$set(dirObj, "loading", true);
      const apis = this.$store.state.githubapi.api;
      const outlineNameReg = apis[repo].fileFilter;
      // Issue HTTP request
      this.$http.get(dirObj.url).then(response => {
        const pdfFormatReg = this.$store.state.regexpre.pdfFormatReg;
        const pptFormatReg = this.$store.state.regexpre.pptFormatReg;

        for (let i = 0; i < response.data.length; i++) {
          if (outlineNameReg.test(response.data[i].name)) {
            // Filter only outline files in markdown format
            let { sha, size, path } = response.data[i];
            // Set the metadata, change loading status
            this.$set(dirObj, "resource", {
              sha, path, repo, size: size / 1024,
              copyLink: "https://mrdrivingduck.github.io/#/markdown?repo=" + repo + "&path=" + path
            });
            this.$set(dirObj, "loading", false);

          } else if (pdfFormatReg.test(response.data[i].name)) {
            let { download_url } = response.data[i];
            this.$set(dirObj, "pdf", { download_url });
          } else if (pptFormatReg.test(response.data[i].name)) {
            let { download_url } = response.data[i];
            this.$set(dirObj, "slide", { download_url });
          }
        }

      }).catch(error => {
        // HTTP failure
        this.fail = true;
        this.failReason = error.message;
      });
    },

    // Jump to the outline detail
    clickOutline: function (outline) {
      this.$router.push({
        path: "/markdown",
        query: {
          repo: outline.repo,
          path: outline.path
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
    this.loadOutlineDirectory();
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
      this.loadOutlineDirectory();
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