<!-- 

  @author - Mr Dk.
  @version - 2021/08/08

  @description - 
    Public component for link clipboarding.

-->

<template>
  <div>
    📌
    <el-link
      type="warning"
      v-clipboard:copy="this.url"
      v-clipboard:success="onCopySuccess"
      v-clipboard:error="onCopyError">
      {{ this.hint }}
    </el-link>
  </div>
</template>

<script>
export default {
  props: [
    "url",
    "hint"
  ],

  methods: {

    // For copying links hint (success)
    onCopySuccess() {
      this.$notify({
        title: "Copy successfully 😁",
        message: "The link is on your clipboard.",
        type: "success"
      });
    },

    // For copying links hint (failed)
    onCopyError() {
      this.$notify({
        title: "Copy failed 😥",
        message: "There might be a BUG.",
        type: "error"
      });
    }
  }
}
</script>
