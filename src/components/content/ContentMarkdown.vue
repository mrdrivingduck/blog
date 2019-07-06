<!-- 

  @author - Mr Dk.
  @version - 2019/07/07

  @description - 
    The content component for displaying markdown files

-->

<template>
  <div >

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

</style>

<script>

export default {
  data: function () {
    return  {
      htmlStr: null,
      loading: true, // For displaying loading status
      fail: false, // Set to true if loading error occurs
      failReason: "" // Reason of failure
    };
  },
  methods: {

  },
  created: function () {

  },
  computed: {

  },
  watch: {

  }
}
</script>