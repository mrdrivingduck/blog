/**
 * @author Mr Dk.
 * @version 2019/07/30
 * @description
 *    Vuex store for saving current content component
 */

const state = {
  api: [
    {
      // user info
      content: "https://api.github.com/users/mrdrivingduck",
      // GitHub page repo commit
      commit: "https://api.github.com/repos/mrdrivingduck/mrdrivingduck.github.io/commits?path=",
      // GitHub page repo deploy
      deploy: "https://api.github.com/repos/mrdrivingduck/mrdrivingduck.github.io/deployments"
    },
    {
      // notes content
      content: "https://api.github.com/repos/mrdrivingduck/notes/contents/",
      // notes commit record
      commit: "https://api.github.com/repos/mrdrivingduck/notes/commits?path=",
      // url replacement prefix of images in the notes
      img_prefix: "https://raw.githubusercontent.com/mrdrivingduck/notes/master/"
    },
    {
      // paper outline content
      content: "https://api.github.com/repos/mrdrivingduck/paper-outline/contents/",
      // paper outline commit record
      commit: "https://api.github.com/repos/mrdrivingduck/paper-outline/commits?path=",
      // url replacement prefix of images in the paper outlines
      img_prefix: "https://raw.githubusercontent.com/mrdrivingduck/paper-outline/master/"
    }
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
