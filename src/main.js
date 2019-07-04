/**
 * @author Mr Dk.
 * @version 2019/07/04
 * @description 
 *    The entry file.
 */

import Vue from "vue";
import VueResource from "vue-resource";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import App from "./App.vue";
import store from "./store";

Vue.use(VueResource);
Vue.use(ElementUI);

Vue.config.productionTip = false;

new Vue({
  store, // Vuex
  render: h => h(App),
}).$mount("#app");
