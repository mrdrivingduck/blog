<!-- 

  @author - Mr Dk.
  @version - 2020/01/27

  @description - 
    The not-found content component.

-->

<template>
  <div :class="theme">

    <h1>
      😦 Resource not found.
    </h1>

    <p>
      If a bug from the website lead you here, please tell me. I'll be glad to know.
    </p>
    <p>Otherwise, you may enter a wrong URL. </p>

    <ul>
      <li>
        <el-link type="primary" href="mailto:mrdrivingduck@gmail.com">
          🚧 Report a BUG of the website
        </el-link>
      </li>
      <li>
        <router-link to="/">
          <el-link type="primary">
            🥱 Back to the index
          </el-link>
        </router-link>
      </li>
    </ul>

  </div>
</template>

<style>
  .dark h1, .dark h2, .dark p, .dark li {
    color: #ffffff;
  }
  .dark h1 {
    margin-top: 50px;
  }
  .light h1, .light h2, .light p, .light li {
    color: #000000;
  }
  .light h1 {
    margin-top: 50px;
  }
</style>

<script>
export default {
  name: "ContentNotFound",
  props: [ "theme" ]
}
</script>

