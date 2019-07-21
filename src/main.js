/**
 * @author Mr Dk.
 * @version 2019/07/21
 * @description 
 *    The entry file.
 */

import Vue from "vue";
import VueResource from "vue-resource";
import ElementUI from "element-ui";

Vue.use(VueResource);
Vue.use(ElementUI);

/**
 * Styles
 */

// Element-UI's style
// import "element-ui/lib/theme-chalk/index.css";
import "../theme/index.css" // Self-define theme

// Markdown's style
import "duckling-markdown-css/github-markdown.css";
import "duckling-markdown-css/github-markdown-dark.css";

// Code highlighting style
import "duckling-highlight/styles/atom-one-light.css";
import "duckling-highlight/styles/atom-one-dark.css";

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
