<!-- 

  @author - Mr Dk.
  @version - 2020/01/26

  @description - 
    The main component for displaying contents

-->

<template>
  <div>
    
    <!-- <component :is="current" :theme="theme"></component> -->
    <router-view :theme="theme"></router-view>

  </div>
</template>

<script>
export default {
  components: {
    // ContentIndex: () => import("./content/ContentIndex"),
    // ContentMarkdown: () => import("./content/ContentMarkdown"),
    // ContentPaperOutline: () => import("./content/ContentPaperOutline"),
    // ContentNoteList: () => import("./content/ContentNoteList")
  },
  props: [ "theme" ],
  data: function () {
    return {
      current: "ContentIndex"
    };
  },
  computed: {
    contentStore: function () {
      return this.$store.state.content.currentComponent;
    }
  },
  watch: {
    contentStore: function (newContent) {
      this.current = newContent;
    }
  }
}
</script>