<!-- 

  @author - Mr Dk.
  @version - 2019/09/11

  @description - 
    The content component for displaying paper outlines

-->

<template>
  <div>

    <!-- Content -->
    <div
      v-if="!fail"
      v-loading="loading">

      <!-- Every card for paper outlines -->
      <el-card
        v-for="outline in outlines"
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
              🔏 SHA: <b> {{ outline.resource.sha }} </b>
            </p>
            <p>
              ✒️ Size: <b> {{ outline.resource.size }} </b> Bytes
            </p>
            <p>
              🔗 <el-link :href="outline.pdf.download_url" type="primary"> PDF </el-link>
            </p>
          </div>
        </div>

      </el-card>
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
  data: function () {
    return  {
      outlines: null, // For outlines in a repository directory
      loading: true, // For displaying loading status
      fail: false, // Set to true if loading error occurs
      failReason: "", // Reason of failure

      cardBackgroundColor: null,
      cardTextColor: null
    };
  },
  methods: {

    // Load one of the outline topic
    loadOutlineDirectory: function () {
      // Get topic URL
      const url = this.$store.state.paper_outline.outline_url;
      // Initialize component status
      this.outlines = [];
      this.fail = false;
      this.failReason = "";
      this.loading = true;
      // Issue HTTP request
      this.$http.get(url).then(response => {

        for (let i = 0; i < response.data.length; i++) {
          let { url, name, sha, html_url } = response.data[i];
          this.outlines.push({ url, name, sha, html_url });
        }
        // All directories in a topic load complete
        this.loading = false;
        // Start loading outline file metadata in each derectory
        for (let i = 0; i < this.outlines.length; i++) {
          this.loadOutlineUrl(this.outlines[i].url, this.outlines[i]);
        }
        
      }).catch(error => {
        // HTTP failure
        this.fail = true;
        this.failReason = error;
      });
    },

    // Load outline file metadata in a directory
    loadOutlineUrl: function (url, dirObj) {
      // Set loading status of metadata
      this.$set(dirObj, "loading", true);
      // Issue HTTP request
      this.$http.get(url).then(response => {
        const outlineNameReg = this.$store.state.regexpre.outlineNameReg;
        const pdfFormatReg = this.$store.state.regexpre.pdfFormatReg;

        for (let i = 0; i < response.data.length; i++) {
          if (outlineNameReg.test(response.data[i].name)) {
            // Filter only outline files in markdown format
            let { url, sha, size, html_url, path } = response.data[i];
            // Set the metadata, change loading status
            this.$set(dirObj, "resource", { url, sha, size, html_url, path });
            this.$set(dirObj, "loading", false);

          } else if (pdfFormatReg.test(response.data[i].name)) {
            let { download_url } = response.data[i];
            this.$set(dirObj, "pdf", { download_url });
          }
        }

      }).catch(error => {
        // HTTP failure
        this.fail = true;
        this.failReason = error;
      });
    },

    // Jump to the outline detail
    clickOutline: function (outlineObj) {
      this.$store.commit("setMarkdownUrl", {
        url: outlineObj.url,
        metadata: {
          link: outlineObj.html_url,
          sha: outlineObj.sha,
          size: outlineObj.size,
          path: outlineObj.path
        }
      });
      this.$store.commit("setCurrentContent", { currentComponent: "ContentMarkdown" });
    },

    // Set the background color and text color of the cards
    setCardTheme: function () {
      const themeIndex = this.$store.state.theme.currentThemeIndex;
      const allThemes = this.$store.state.theme.themes;
      let { backgroundColor, textColor } = allThemes[themeIndex].card;
      this.cardBackgroundColor = backgroundColor;
      this.cardTextColor = textColor;
    }

  },
  created: function () {
    // Initializing the data from GitHub
    this.loadOutlineDirectory();
    this.setCardTheme();
  },
  computed: {

    // Listening for the URL changed
    urlChange: function () {
      return this.$store.state.paper_outline.outline_url;
    },

    // Listening for the theme changed
    themeChange: function () {
      return this.$store.state.theme.currentThemeIndex;
    }

  },
  watch: {

    // The URL change triggered
    // Reinitializing the conponent's status
    urlChange: function () {
      this.loadOutlineDirectory();
    },

    // Set the theme of the card
    themeChange: function () {
      this.setCardTheme();
    }

  }
}
</script>