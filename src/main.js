/**
 * @author Mr Dk.
 * @version 2019/08/01
 * @description 
 *    The entry file.
 */

import Vue from "vue";
import ElementUI from "element-ui";
import Axios from "axios";

Vue.use(ElementUI);
Vue.prototype.$http = Axios;

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

/**
 * Instantiation
 */
new Vue({
  store, // register the Vuex store
  render: h => h(App),
}).$mount("#app");
