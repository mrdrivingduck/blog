<!-- 

  @author - Mr Dk.
  @version - 2019/07/03

  @description - 
    The aside component for guiding

-->

<template>
  <div>
    
    <!-- The menu on the left -->
    <el-menu>

      <!-- Sub-menu of notes -->
      <aside-notes :index="1"></aside-notes>

      <!-- Sub-menu of paper-outline -->
      <aside-paper-outline :index="2"></aside-paper-outline>

    </el-menu>
    
  </div>
</template>

<style>

</style>

<script>
import AsideNotes from "./aside/AsideNotes.vue";
import AsidePaperOutline from "./aside/AsidePaterOutline.vue";

export default {
  components: {
    AsideNotes,
    AsidePaperOutline
  }
}
</script>