/**
 * @author Mr Dk.
 * @version 2020/01/27
 * @description
 *    Vuex store for saving current content component
 */

const state = {
  api: {
    user: {
      /**
       * user info
       *    commit - GitHub page repo commit
       *    deploy - GitHub page repo deploy
       */
      content: "https://api.github.com/users/mrdrivingduck",
      commit: "https://api.github.com/repos/mrdrivingduck/mrdrivingduck.github.io/commits?path=",
      deploy: "https://api.github.com/repos/mrdrivingduck/mrdrivingduck.github.io/deployments"
    },
    notes: {
      /**
       * notes content
       *    commit: notes commit record
       *    img_prefix: url replacement prefix of images in the notes
       *    img_matcher: image url in notes -  <img src="../img/
       */
      content: "https://api.github.com/repos/mrdrivingduck/notes/contents/",
      commit: "https://api.github.com/repos/mrdrivingduck/notes/commits?path=",
      img_prefix: '<img src="https://raw.githubusercontent.com/mrdrivingduck/notes/master/img/',
      img_matcher: /<img\ssrc="\.\.\/img\//g,
      file_filter: /^Chapter.*$/,
      dir_filter: /^[A-Z].*$/
    },
    paper_outline: {
      /**
       * paper outline content
       *    commit: notes commit record
       *    img_prefix: url replacement prefix of images in the notes
       *    img_matcher: image url in notes -  <img src="../img/
       */
      content: "https://api.github.com/repos/mrdrivingduck/paper-outline/contents/",
      commit: "https://api.github.com/repos/mrdrivingduck/paper-outline/commits?path=",
      img_prefix: '<img src="https://raw.githubusercontent.com/mrdrivingduck/paper-outline/master/img/',
      img_matcher: /<img\ssrc="\.\.\/\.\.\/img\//g,
      file_filter: /^Outline.*$/,
      dir_filter: /^[A-Z].*$/
    },
    how_linux_works_notes: {
      /**
       * how linux works notes content
       *    commit: notes commit record
       *    img_prefix: url replacement prefix of images in the notes
       *    img_matcher: image url in notes -  <img src="../img/
       */
      content: "https://api.github.com/repos/mrdrivingduck/how-linux-works-notes/contents/",
      commit: "https://api.github.com/repos/mrdrivingduck/how-linux-works-notes/commits?path=",
      img_prefix: '<img src="https://raw.githubusercontent.com/mrdrivingduck/how-linux-works-notes/master/img/',
      img_matcher: /<img\ssrc="\.\/img\//g,
      file_filter: /^Chapter.*$/,
      // dir_filter: /^Chapter.*$/
      sort: function (a, b) {
        let idxFrontArr = a.name.split("-")[0].split(" ")[1].split(".");
        let idxBackArr = b.name.split("-")[0].split(" ")[1].split(".");

        // Chapter 12.10 - xxxxxx
        // Chapter 12 - xxxxxx
        if (idxFrontArr[0] === idxBackArr[0]) {
          return parseInt(idxFrontArr[1]) - parseInt(idxBackArr[1]);
        } else {
          return parseInt(idxFrontArr[0]) - parseInt(idxBackArr[0]);
        }
      }
    },
    linux_kernel_comments_notes: {
      /**
       * linux kernel comments notes content
       *    commit: notes commit record
       *    img_prefix: url replacement prefix of images in the notes
       *    img_matcher: image url in notes -  <img src="../img/
       */
      content: "https://api.github.com/repos/mrdrivingduck/linux-kernel-comments-notes/contents/",
      commit: "https://api.github.com/repos/mrdrivingduck/linux-kernel-comments-notes/commits?path=",
      img_prefix: '<img src="https://raw.githubusercontent.com/mrdrivingduck/linux-kernel-comments-notes/master/img/',
      img_matcher: /<img\ssrc="\.\.\/img\//g,
      file_filter: /^.*\.md$/,
      dir_filter: /^Chapter.*$/,
      sort: function (a, b) {
        let idxFrontArr = a.name.split("-")[0].split(" ")[1].split(".");
        let idxBackArr = b.name.split("-")[0].split(" ")[1].split(".");

        // Chapter 12.10 - xxxxxx
        // Chapter 12 - xxxxxx
        if (idxFrontArr[0] === idxBackArr[0]) {
          return parseInt(idxFrontArr[1]) - parseInt(idxBackArr[1]);
        } else {
          return parseInt(idxFrontArr[0]) - parseInt(idxBackArr[0]);
        }
      }
    },
    linux_kernel_development_notes: {
      /**
       * linux kernel development notes content
       *    commit: notes commit record
       *    img_prefix: url replacement prefix of images in the notes
       *    img_matcher: image url in notes -  <img src="../img/
       */
      content: "https://api.github.com/repos/mrdrivingduck/linux-kernel-development-notes/contents/",
      commit: "https://api.github.com/repos/mrdrivingduck/linux-kernel-development-notes/commits?path=",
      img_prefix: '<img src="https://raw.githubusercontent.com/mrdrivingduck/linux-kernel-development-notes/master/img/',
      img_matcher: /<img\ssrc="\.\/img\//g,
      file_filter: /^Chapter.*$/,
      sort: function (a, b) {
        let idxFrontArr = a.name.split("-")[0].split(" ")[1].split(".");
        let idxBackArr = b.name.split("-")[0].split(" ")[1].split(".");

        // Chapter 12.10 - xxxxxx
        // Chapter 12 - xxxxxx
        if (idxFrontArr[0] === idxBackArr[0]) {
          return parseInt(idxFrontArr[1]) - parseInt(idxBackArr[1]);
        } else {
          return parseInt(idxFrontArr[0]) - parseInt(idxBackArr[0]);
        }
      }
    },
    us_os_ii_code_notes: {
      /**
       * μC/OS-II notes content
       *    commit: notes commit record
       *    img_prefix: url replacement prefix of images in the notes
       *    img_matcher: image url in notes -  <img src="../img/
       */
      content: "https://api.github.com/repos/mrdrivingduck/uc-os-ii-code-notes/contents/",
      commit: "https://api.github.com/repos/mrdrivingduck/uc-os-ii-code-notes/commits?path=",
      img_prefix: '',
      img_matcher: /<img\ssrc="\.\/img\//g,
      file_filter: /^.*\.md$/,
      dir_filter: /^Chapter.*$/,
      sort: function (a, b) {
        let idxFrontArr = a.name.split("-")[0].split(" ")[1].split(".");
        let idxBackArr = b.name.split("-")[0].split(" ")[1].split(".");

        // Chapter 12.10 - xxxxxx
        // Chapter 12 - xxxxxx
        if (idxFrontArr[0] === idxBackArr[0]) {
          return parseInt(idxFrontArr[1]) - parseInt(idxBackArr[1]);
        } else {
          return parseInt(idxFrontArr[0]) - parseInt(idxBackArr[0]);
        }
      }
    },
    jdk_source_code_analysis: {
      /**
       * JDK source code analysis notes content
       *    commit: notes commit record
       *    img_prefix: url replacement prefix of images in the notes
       *    img_matcher: image url in notes -  <img src="../img/
       */
      content: "https://api.github.com/repos/mrdrivingduck/jdk-source-code-analysis/contents/",
      commit: "https://api.github.com/repos/mrdrivingduck/jdk-source-code-analysis/commits?path=",
      img_prefix: '',
      img_matcher: /<img\ssrc="\.\/img\//g,
      file_filter: /^(Class|Abstract|Interface).*$/,
      sort: function(a, b) {
        const a_key = a.name.split(" ")[0];
        const b_key = b.name.split(" ")[0];

        if (a_key === b_key) {
          return a - b;
        } else if (a_key === "Class") {
          return -1;
        } else if (b_key === "Class") {
          return 1;
        } else if (a_key === "Abstract") {
          return -1;
        } else if (b_key === "Abstract") {
          return 1;
        } else {
          return a - b;
        }
      }
    }
  },
  emotion: {
    url: "https://api.github.com/repos/mrdrivingduck/emotions/contents/",
    file_filter: /^[^.]*$/,
  },
  api_suffix: "?ref=master"
};

const mutations = {

};

export default {
  state,
  mutations
}
