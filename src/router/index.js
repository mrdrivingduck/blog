/**
 * @author Mr Dk.
 * @version 2020/01/27
 * @description
 *    Vuex router for routing components
 */

import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      component: () => import("../components/content/ContentIndex")
    },
    {
      path: "/markdown",
      component: () => import("../components/content/ContentMarkdown")
    },
    {
      path: "/outlinelist",
      component: () => import("../components/content/ContentPaperOutline")
    },
    {
      path: "/notelist",
      component: () => import("../components/content/ContentNoteList")
    },
    {
      path: "*",
      component: () => import("../components/content/ContentNotFound")
    }
  ]
});
