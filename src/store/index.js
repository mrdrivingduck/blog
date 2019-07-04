/**
 * @author Mr Dk.
 * @version 2019/07/04
 */

import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

import paper_outline from "./modules/paper-outline.js";

export default new Vuex.Store({
  modules: {
    paper_outline
  }
});
