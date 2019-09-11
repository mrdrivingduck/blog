/**
 * @author Mr Dk.
 * @version 2019/09/10
 * @description
 *    Entry of different modules of Vuex store.
 */

import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

import paper_outline from "./modules/paper-outline.js";
import markdown from "./modules/markdown.js";
import content from "./modules/content.js";
import theme from "./modules/theme.js";
import githubapi from "./modules/githubapi.js";
import regexpre from "./modules/regexpre.js";
import notelist from "./modules/notelist.js";

export default new Vuex.Store({
  modules: {
    paper_outline,
    markdown,
    content,
    theme,
    githubapi,
    regexpre,
    notelist
  }
});
