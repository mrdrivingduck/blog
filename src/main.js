/**
 * @author Mr Dk.
 * @version 2019/07/08
 * @description 
 *    The entry file.
 */

import Vue from "vue";
import VueResource from "vue-resource";
import ElementUI from "element-ui";
import hljs from "highlightjs";

Vue.use(VueResource);
Vue.use(ElementUI);

/**
 * Styles
 */
// Element-UI's style
import "element-ui/lib/theme-chalk/index.css";
// Markdown's style
import "github-markdown-css/github-markdown.css";
import "./style/github-markdown-dark.css"
// Code highlighting style
import "highlightjs/styles/atom-one-light.css";
import "highlightjs/styles/atom-one-dark.css";

/**
 * Self-define instruction for code highlighting
 */
Vue.directive('highlight',function (el) {
  let blocks = el.querySelectorAll('pre code');
  blocks.forEach((block)=>{
    hljs.highlightBlock(block)
  })
})

/**
 * Main component
 */
import App from "./App.vue";
/**
 * Vuex store
 */
import store from "./store";

new Vue({
  store, // Vuex
  render: h => h(App),
}).$mount("#app");
