/**
 * @author Mr Dk.
 * @version 2021/08/08
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
      path: "/issues",
      component: () => import("../components/content/ContentIssues")
    },
    {
      path: "/issuetimeline",
      component: () => import("../components/content/ContentIssueTimeline")
    },
    {
      path: "*",
      component: () => import("../components/content/ContentNotFound")
    }
  ]
});
