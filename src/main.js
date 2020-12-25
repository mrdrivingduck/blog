/**
 * @author Mr Dk.
 * @version 2020/12/25
 * @description 
 *    The entry file.
 */

import Vue from "vue";
import ElementUI from "element-ui";
import Axios from "axios";
import VueClipboard from "vue-clipboard2";

Vue.use(VueClipboard);
Vue.use(ElementUI);
Vue.prototype.$http = Axios;

/**
 * Styles
 */

// Element-UI's style
// import "element-ui/lib/theme-chalk/index.css";
import "../theme/index.css" // Self-define theme

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
 * Vue router
 */
import router from "./router";

/**
 * Instantiation
 */
new Vue({
  store,  // register the Vuex store
  router, // register the Vue router
  render: h => h(App),
}).$mount("#app");
