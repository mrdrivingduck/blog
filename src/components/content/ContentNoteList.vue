<!-- 

  @author - Mr Dk.
  @version - 2020/02/04

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
          💾 Size: <b> {{ note.size }} </b> Bytes
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
      const repo = this.$route.query.repo;
      const path = this.$route.query.path;
      const apis = this.$store.state.githubapi.api;
      const reg_expr = apis[repo].file_filter;
      const file_filter = apis[repo].sort;
      // Get topic URL
      const url = this.$store.state.githubapi.api[repo].content + path;
      // Initialize component status
      this.notes = [];
      this.fail = false;
      this.failReason = "";
      this.loading = true;
      // Issue HTTP request
      this.$http.get(url).then(response => {
        for (let i = 0; i < response.data.length; i++) {
          if (reg_expr.test(response.data[i].name)) {
            let { name, path, sha, size } = response.data[i];
            this.notes.push({
              name: name.replace(".md", ""), path, sha, size, repo
            });
          }
        }

        this.notes.sort(file_filter);

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
      this.$router.push({
        path: "/markdown",
        query: {
          repo: note.repo,
          path: note.path
        }
      }).catch(err => { err });
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

    // Listening for the theme changed
    themeChange: function () {
      return this.$store.state.theme.currentThemeIndex;
    }

  },
  watch: {

    // Set the theme of the card
    themeChange: function () {
      this.setCardTheme();
    },

    $route: function() {
      this.loadNoteDirectory();
    }

  }
}
</script>