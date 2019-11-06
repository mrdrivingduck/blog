/**
 * @author Mr Dk.
 * @version 2019/11/06
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
      // home
    },
    {
      // notes content
      content: "https://api.github.com/repos/mrdrivingduck/notes/contents/",
      // notes commit record
      commit: "https://api.github.com/repos/mrdrivingduck/notes/commits?path=",
      // url replacement prefix of images in the notes
      img_prefix: '<img src="https://raw.githubusercontent.com/mrdrivingduck/notes/master/img/',
      // image url in notes -  <img src="../img/
      img_matcher: /<img\ssrc="\.\.\/img\//g
    },
    {
      // paper outline content
      content: "https://api.github.com/repos/mrdrivingduck/paper-outline/contents/",
      // paper outline commit record
      commit: "https://api.github.com/repos/mrdrivingduck/paper-outline/commits?path=",
      // url replacement prefix of images in the paper outlines
      img_prefix: '<img src="https://raw.githubusercontent.com/mrdrivingduck/paper-outline/master/img/',
      // image url in paper outlines - <img src="../../img/
      img_matcher: /<img\ssrc="\.\.\/\.\.\/img\//g
    },
    {
      // how-linux-works notes content
      content: "https://api.github.com/repos/mrdrivingduck/how-linux-works-notes/contents/",
      // how-linux-works notes commit record
      commit: "https://api.github.com/repos/mrdrivingduck/how-linux-works-notes/commits?path=",
      // url replacement prefix of images in how-linux-works
      img_prefix: '<img src="https://raw.githubusercontent.com/mrdrivingduck/how-linux-works-notes/master/img/',
      // image url in how-linux-works - <img src="./img/
      img_matcher: /<img\ssrc="\.\/img\//g
    },
    {
      // linux-kernel-comments notes content
      content: "https://api.github.com/repos/mrdrivingduck/linux-kernel-comments-notes/contents/",
      // linux-kernel-comments notes commit record
      commit: "https://api.github.com/repos/mrdrivingduck/linux-kernel-comments-notes/commits?path=",
      // url replacement prefix of images in linux-kernel-comments-notes
      img_prefix: '<img src="https://raw.githubusercontent.com/mrdrivingduck/linux-kernel-comments-notes/master/img/',
      // image url in linux-kernel-comments - <img src="../img/
      img_matcher: /<img\ssrc="\.\.\/img\//g
    },
    {
      // linux-kernel-development-notes notes content
      content: "https://api.github.com/repos/mrdrivingduck/linux-kernel-development-notes/contents/",
      // linux-kernel-development-notes notes commit record
      commit: "https://api.github.com/repos/mrdrivingduck/linux-kernel-development-notes/commits?path=",
      // url replacement prefix of images in linux-kernel-development-notes
      img_prefix: '<img src="https://raw.githubusercontent.com/mrdrivingduck/linux-kernel-development-notes/master/img/',
      // image url in inux-kernel-development-notes - <img src="./img/
      img_matcher: /<img\ssrc="\.\/img\//g
    },
  ],
  emotion: {
    url: "https://api.github.com/repos/mrdrivingduck/emotions/contents/"
  },
  url_index: 0
};

const mutations = {

  // Set the index on the navigate into global
  setCommitUrlIndex: function (state, { index }) {
    state.url_index = index;
  }

};

export default {
  state,
  mutations
}
