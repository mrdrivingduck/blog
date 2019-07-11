/**
 * @author Mr Dk.
 * @version 2019/07/07
 * @description
 *    Entry of different modules of Vuex store.
 */

import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

import paper_outline from "./modules/paper-outline.js";
import markdown from "./modules/markdown.js";
import content from "./modules/content.js";

export default new Vuex.Store({
  modules: {
    paper_outline,
    markdown,
    content
  }
});