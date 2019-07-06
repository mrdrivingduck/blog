/**
 * @author Mr Dk.
 * @version 2019/07/07
 * @description
 *    Vuex store for saving markdown file metadata.
 */

const state = {
  markdown_url: ""
};

const mutations = {
  
  setMarkdownUrl: function (state, { url }) {
    state.markdown_url = url;
  }

};

export default {
  state,
  mutations
}
