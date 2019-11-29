/**
 * @author Mr Dk.
 * @version 2019/11/29
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
      img_matcher: /<img\ssrc="\.\.\/img\//g,
      file_filter: /^Chapter.*$/,
      dir_filter: /^[A-Z].*$/
    },
    {
      // paper outline content
      content: "https://api.github.com/repos/mrdrivingduck/paper-outline/contents/",
      // paper outline commit record
      commit: "https://api.github.com/repos/mrdrivingduck/paper-outline/commits?path=",
      // url replacement prefix of images in the paper outlines
      img_prefix: '<img src="https://raw.githubusercontent.com/mrdrivingduck/paper-outline/master/img/',
      // image url in paper outlines - <img src="../../img/
      img_matcher: /<img\ssrc="\.\.\/\.\.\/img\//g,
      file_filter: /^Outline.*$/,
      dir_filter: /^[A-Z].*$/
    },
    {
      // how-linux-works notes content
      content: "https://api.github.com/repos/mrdrivingduck/how-linux-works-notes/contents/",
      // how-linux-works notes commit record
      commit: "https://api.github.com/repos/mrdrivingduck/how-linux-works-notes/commits?path=",
      // url replacement prefix of images in how-linux-works
      img_prefix: '<img src="https://raw.githubusercontent.com/mrdrivingduck/how-linux-works-notes/master/img/',
      // image url in how-linux-works - <img src="./img/
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
    {
      // linux-kernel-comments notes content
      content: "https://api.github.com/repos/mrdrivingduck/linux-kernel-comments-notes/contents/",
      // linux-kernel-comments notes commit record
      commit: "https://api.github.com/repos/mrdrivingduck/linux-kernel-comments-notes/commits?path=",
      // url replacement prefix of images in linux-kernel-comments-notes
      img_prefix: '<img src="https://raw.githubusercontent.com/mrdrivingduck/linux-kernel-comments-notes/master/img/',
      // image url in linux-kernel-comments - <img src="../img/
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
    {
      // linux-kernel-development-notes notes content
      content: "https://api.github.com/repos/mrdrivingduck/linux-kernel-development-notes/contents/",
      // linux-kernel-development-notes notes commit record
      commit: "https://api.github.com/repos/mrdrivingduck/linux-kernel-development-notes/commits?path=",
      // url replacement prefix of images in linux-kernel-development-notes
      img_prefix: '<img src="https://raw.githubusercontent.com/mrdrivingduck/linux-kernel-development-notes/master/img/',
      // image url in linux-kernel-development-notes - <img src="./img/
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
    {
      // μC/OS-II notes content
      content: "https://api.github.com/repos/mrdrivingduck/uc-os-ii-code-notes/contents/",
      // μC/OS-II notes commit record
      commit: "https://api.github.com/repos/mrdrivingduck/uc-os-ii-code-notes/commits?path=",
      // url replacement prefix of images in μC/OS-II
      img_prefix: '',
      // image url in μC/OS-II
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
    {
      // JDK source code analysis notes content
      content: "https://api.github.com/repos/mrdrivingduck/jdk-source-code-analysis/contents/",
      // JDK source code analysis notes commit record
      commit: "https://api.github.com/repos/mrdrivingduck/jdk-source-code-analysis/commits?path=",
      // url replacement prefix of images in JDK source code analysis
      img_prefix: '',
      // image url in JDK source code analysis
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
  ],
  emotion: {
    url: "https://api.github.com/repos/mrdrivingduck/emotions/contents/"
  }
};

const mutations = {

};

export default {
  state,
  mutations
}
