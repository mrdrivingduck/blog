<!-- 

  @author - Mr Dk.
  @version - 2019/07/05

  @description - 
    The main component for displaying contents

-->

<template>
  <div>
    
    <component v-bind:is="current"></component>

  </div>
</template>

<style>

</style>

<script>
import ContentIndex from "./content/ContentIndex.vue";
import ContentMarkdown from "./content/ContentMarkdown.vue";
import ContentPaperOutline from "./content/ContentPaperOutline.vue";

export default {
  components: {
    ContentIndex,
    ContentMarkdown,
    ContentPaperOutline
  },
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