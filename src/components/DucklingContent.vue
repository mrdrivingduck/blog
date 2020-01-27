<!-- 

  @author - Mr Dk.
  @version - 2020/01/27

  @description - 
    The main component for displaying contents

-->

<template>
  <div>
    
    <router-view :theme="theme"></router-view>

  </div>
</template>

<script>
export default {
  props: [ "theme" ]
}
</script>