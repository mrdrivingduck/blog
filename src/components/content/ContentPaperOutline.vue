<!-- 

  @author - Mr Dk.
  @version - 2019/07/04

  @description - 
    The content component for displaying paper outlines

-->

<template>
  <div>

    <p> Out Line </p>
    
  </div>
</template>

<style>

</style>

<script>
// Filter only directory
// const dirNameReg = /^[A-Z].*$/;
// Filter only outline markdown files
// const outlineNameReg = /^Outline.*$/;

export default {
  props: ["index"],
  data: function () {
    return  {
      /**
       * For outlines in a repository directory
       */
      outlines: [
        {
          name: "OUT1"
        },
        {
          name: "OUT2"
        }
      ],
      /**
       * For displaying loading status
       */
      loading: true,
      /**
       * Set to true if loading error occurs
       */
      fail: false,
      /**
       * Reason of failure
       */
      failReason: ""
    };
  },
  methods: {

    // loadDirectories: function (url) {
    //   // Set loading status
    //   this.loading = true;
    //   // Issur HTTP Request
    //   this.$http.get(url).then(response => {
        
    //     this.outlineDir = [];
    //     for (let i = 0; i < response.body.length; i++) {
    //       if (dirNameReg.test(response.body[i].name) && response.body[i].type === "dir") {
    //         this.outlineDir.push(response.body[i]);
    //       }
    //     }
        
    //     // Directories loading complete
    //     this.loading = false;

    //   }, error => {
    //     // HTTP failed
    //     this.fail = true;
    //     this.failReason = "Status: " + error.status;
    //   });
    // }

  },
  created: function () {
    // Initializing the data from GitHub
    // this.loadDirectories("https://api.github.com/repos/mrdrivingduck/paper-outline/contents/")
  }
}
</script>