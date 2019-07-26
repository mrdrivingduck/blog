/**
 * @author Mr Dk.
 * @version 2019/07/25
 * @description
 *    Vuex store for saving current content component
 */

const state = {
  person: "https://api.github.com/users/mrdrivingduck",
  paper_outline: "https://api.github.com/repos/mrdrivingduck/paper-outline/contents/",
  notes: "https://api.github.com/repos/mrdrivingduck/notes/contents/",
  commit_url: [
    "",
    "https://api.github.com/repos/mrdrivingduck/notes/commits?path=",
    "https://api.github.com/repos/mrdrivingduck/paper-outline/commits?path="
  ],
  url_index: 0
};

const mutations = {

  setCommitUrlIndex: function (state, { index }) {
    state.url_index = index;
  }

};

export default {
  state,
  mutations
}
