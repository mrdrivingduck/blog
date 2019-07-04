/**
 * @author Mr Dk.
 * @version 2019/07/05
 * @description
 *    The vue-router definition.
 */

import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/paperoutline",
      component: () => import("../components/content/ContentPaperOutline.vue")
    }
  ]
});