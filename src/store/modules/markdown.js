/**
 * @author Mr Dk.
 * @version 2019/07/21
 * @description
 *    Vuex store for saving markdown file metadata.
 */

const state = {
  markdown_url: "",

  link: "",
  sha: "",
  size: "",
  path: ""
};

const mutations = {
  
  setMarkdownUrl: function (state, { url, metadata }) {
    state.markdown_url = url;

    let { link, sha, size, path } = metadata;
    state.link = link;
    state.sha = sha;
    state.size = size / 1024;
    state.path = path;
  }

};

export default {
  state,
  mutations
}
