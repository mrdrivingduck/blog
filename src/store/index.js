/**
 * @author Mr Dk.
 * @version 2019/01/27
 * @description
 *    Entry of different modules of Vuex store.
 */

import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

import theme from "./modules/theme.js";
import githubapi from "./modules/githubapi.js";
import regexpre from "./modules/regexpre.js";

export default new Vuex.Store({
  modules: {
    theme,
    githubapi,
    regexpre
  }
});
