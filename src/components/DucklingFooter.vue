<template>
  <div>
    <p @click="click">Footer</p>
  </div>
</template>

<style>

</style>

<script>
export default {
  methods: {

    click: function () {
      this.$store.commit("setCurrentContent", { currentComp: "ContentMarkdown" });
    }

  }
}
</script>

