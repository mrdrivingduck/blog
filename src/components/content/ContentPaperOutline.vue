<!-- 

  @author - Mr Dk.
  @version - 2019/07/05

  @description - 
    The content component for displaying paper outlines

-->

<template>
  <div >

    <div
      v-if="!fail"
      v-loading="loading">

      <el-card
        v-for="outline in outlines"
        :key="outline.sha"
        class="margin">

        <div slot="header" class="clearfix">
          <span> <b> {{ outline.name }} </b> </span>
          <el-button style="float: right; padding: 3px 0" type="text">详情</el-button>
        </div>
        <div v-loading="outline.loading">
          <div v-if="outline.resource">
            <p> sha: <b> {{ outline.resource.sha }} </b> </p>
            <p> size: <b> {{ outline.resource.size }} </b> Bytes </p>
          </div>
        </div>

      </el-card>
    </div>

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

<style>
  .margin {
    margin-bottom: 15px
  }
</style>

<script>
// Filter only outline markdown files
const outlineNameReg = /^Outline.*$/;

export default {
  props: ["index"],
  data: function () {
    return  {
      outlines: null, // For outlines in a repository directory
      loading: true, // For displaying loading status
      fail: false, // Set to true if loading error occurs
      failReason: "" // Reason of failure
    };
  },
  methods: {

    /**
     * Load one of the outline topic
     */
    loadOutlineDirectory: function () {
      // Get topic URL
      const url = this.$store.state.paper_outline.outline_url;
      // Initialize and set loading status
      this.outlines = [];
      this.loading = true;
      // Issue HTTP request
      this.$http.get(url).then(response => {

        for (let i = 0; i < response.body.length; i++) {
          let { url, name, sha } = response.body[i];
          this.outlines.push({ url, name, sha });
        }
        // All directories in a topic load complete
        this.loading = false;
        // Start loading outline file metadata in each derectory
        for (let i = 0; i < this.outlines.length; i++) {
          this.loadOutlineUrl(this.outlines[i].url, this.outlines[i]);
        }
        
      }, error => {
        // HTTP failure
        this.fail = true;
        this.failReason = "Status: " + error.status;
      });
    },

    /**
     * Load outline file metadata in a directory
     */
    loadOutlineUrl: function (url, dirObj) {
      // Set loading status of metadata
      this.$set(dirObj, "loading", true);
      // Issue HTTP request
      this.$http.get(url).then(response => {
        for (let i = 0; i < response.body.length; i++) {
          if (outlineNameReg.test(response.body[i].name)) {
            // Filter only outline files in markdown format
            let { url, sha, size } = response.body[i];
            // Set the metadata, change loading status
            this.$set(dirObj, "resource", { url, sha, size });
            this.$set(dirObj, "loading", false);
          }
        }
      }, error => {
        // HTTP failure
        this.fail = true;
        this.failReason = "Status: " + error.status;
      });
    }

  },
  created: function () {
    // Initializing the data from GitHub
    this.loadOutlineDirectory();
  },
  computed: {
    /**
     * Clicking on the aside will trigger URL changed
     */
    urlChange: function () {
      return this.$store.state.paper_outline.outline_url;
    }
  },
  watch: {
    /**
     * The URL change triggered
     * Reinitializing the conponent's status
     */
    urlChange: function () {
      this.loading = true;
      this.fail = false;
      this.failReason = "";
      this.loadOutlineDirectory();
    }
  }
}
</script>