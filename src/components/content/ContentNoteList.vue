<!-- 

  @author - Mr Dk.
  @version - 2019/11/29

  @description - 
    The content component for displaying note list

-->

<template>
  <div>

    <!-- Content -->
    <div
      v-if="!fail"
      v-loading="loading">

      <!-- Every card for note -->
      <el-card
        v-for="note in notes"
        :key="note.sha"
        shadow="hover"
        style="margin-bottom: 15px;"
        v-bind:style="{ backgroundColor: cardBackgroundColor, color: cardTextColor }">

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
          🔏 SHA: <b> {{ note.sha }} </b>
        </p>
        <p>
          ✒️ Size: <b> {{ note.size }} </b> Bytes
        </p>

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
  name: "ContentNoteList",
  data: function () {
    return  {
      notes: null, // Note array
      loading: true, // For displaying loading status
      fail: false, // Set to true if loading error occurs
      failReason: "", // Reason of failure

      cardBackgroundColor: null,
      cardTextColor: null
    };
  },
  methods: {

    // Load one of the outline topic
    loadNoteDirectory: function () {
      // Get topic URL
      const url = this.$store.state.notelist.notes_url;
      const idx = this.$store.state.content.compIndex;
      const apis = this.$store.state.githubapi.api;
      const listReg = apis[idx].file_filter;
      // Initialize component status
      this.notes = [];
      this.fail = false;
      this.failReason = "";
      this.loading = true;
      // Issue HTTP request
      this.$http.get(url).then(response => {
        for (let i = 0; i < response.data.length; i++) {
          if (listReg.test(response.data[i].name)) {
            let { name, url, sha, size, html_url, path } = response.data[i];
            this.notes.push({
              name: name.replace(".md", ""),
              url, sha, size, html_url, path
            });
          }
        }

        this.notes.sort(apis[idx].sort)

        // All directories in a topic load complete
        this.loading = false;
        
      }).catch(error => {
        // HTTP failure
        this.fail = true;
        this.failReason = error.message;
      });
    },

    // Jump to the outline detail
    clickNote: function (note) {
      this.$store.commit("setMarkdownUrl", {
        url: note.url,
        metadata: {
          link: note.html_url,
          sha: note.sha,
          size: note.size,
          path: note.path
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
    this.loadNoteDirectory();
    this.setCardTheme();
  },
  computed: {

    // Listening for the URL changed
    urlChange: function () {
      return this.$store.state.notelist.notes_url;
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
      this.loadNoteDirectory();
    },

    // Set the theme of the card
    themeChange: function () {
      this.setCardTheme();
    }

  }
}
</script>