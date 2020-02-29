/**
 * @author Mr Dk.
 * @version 2020/02/29
 * @description
 *    Vuex store for saving current content component
 */

const state = {
  // GitHub API v4 entry point
  apiv4: "https://api.github.com/graphql",
  // Personal access token
  pat: "8dabb6716643dcb2e3ce0e45da5eee425c8c8c47",
  query: {
    /**
     * User info
     * Commit info
     * Deployment info
     */
    user: `query { 
            user(login: "mrdrivingduck") { name, location, bio, company },
            repository(name: "mrdrivingduck.github.io", owner: "mrdrivingduck") {
              deployments(last: 1) {
                nodes {
                  createdAt, creator { login, url },
                  commit { message, committedDate, committer { user { name, url }, date } }
                }
              }
            }
          }`,
    /**
     * All info in 'Aside'
     */
    aside: `query {
              notes: repository(name: "notes", owner: "mrdrivingduck") {
                object(expression: "master:") {
                  ... on Tree {
                    entries {
                      name
                      type
                      object {
                        ...getDirectory
                      }
                    }
                  }
                }
              }
              paper_outline: repository(name: "paper-outline", owner: "mrdrivingduck") {
                object(expression: "master:") {
                  ...getDirectory
                }
              }
              linux_kernel_comments_notes: repository(name: "linux-kernel-comments-notes", owner: "mrdrivingduck") {
                object(expression: "master:") {
                  ...getDirectory
                }
              }
              us_os_ii_code_notes: repository(name: "uc-os-ii-code-notes", owner: "mrdrivingduck") {
                object(expression: "master:") {
                  ...getDirectory
                }
              }
              understanding_the_jvm: repository(name: "understanding-the-jvm", owner: "mrdrivingduck") {
                object(expression: "master:") {
                  ...getDirectory
                }
              }
            }

            fragment getDirectory on Tree {
              entries {
                name
                type
                oid
              }
            }`,

    notes: {
      /**
       * notes content
       *    commit: notes commit record
       *    imgPrefix: url replacement prefix of images in the notes
       *    imgMatcher: image url in notes -  <img src="../img/
       */
      content: "https://api.github.com/repos/mrdrivingduck/notes/contents/",
      commit: "https://api.github.com/repos/mrdrivingduck/notes/commits?path=",
      imgPrefix: '<img src="https://raw.githubusercontent.com/mrdrivingduck/notes/master/img/',
      imgMatcher: /<img\ssrc="\.\.\/img\//g,
      fileFilter: /^Chapter.*$/,
      dirFilter: /^[A-Z].*$/
    },
    paper_outline: {
      /**
       * paper outline content
       *    commit: notes commit record
       *    imgPrefix: url replacement prefix of images in the notes
       *    imgMatcher: image url in notes -  <img src="../img/
       */
      content: "https://api.github.com/repos/mrdrivingduck/paper-outline/contents/",
      commit: "https://api.github.com/repos/mrdrivingduck/paper-outline/commits?path=",
      imgPrefix: '<img src="https://raw.githubusercontent.com/mrdrivingduck/paper-outline/master/img/',
      imgMatcher: /<img\ssrc="\.\.\/\.\.\/img\//g,
      fileFilter: /^Outline.*$/,
      dirFilter: /^[A-Z].*$/
    },
    how_linux_works_notes: {
      /**
       * how linux works notes content
       *    commit: notes commit record
       *    imgPrefix: url replacement prefix of images in the notes
       *    imgMatcher: image url in notes -  <img src="../img/
       */
      content: "https://api.github.com/repos/mrdrivingduck/how-linux-works-notes/contents/",
      commit: "https://api.github.com/repos/mrdrivingduck/how-linux-works-notes/commits?path=",
      imgPrefix: '<img src="https://raw.githubusercontent.com/mrdrivingduck/how-linux-works-notes/master/img/',
      imgMatcher: /<img\ssrc="\.\/img\//g,
      fileFilter: /^Chapter.*$/,
      // dirFilter: /^Chapter.*$/
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
       *    imgPrefix: url replacement prefix of images in the notes
       *    imgMatcher: image url in notes -  <img src="../img/
       */
      content: "https://api.github.com/repos/mrdrivingduck/linux-kernel-comments-notes/contents/",
      commit: "https://api.github.com/repos/mrdrivingduck/linux-kernel-comments-notes/commits?path=",
      imgPrefix: '<img src="https://raw.githubusercontent.com/mrdrivingduck/linux-kernel-comments-notes/master/img/',
      imgMatcher: /<img\ssrc="\.\.\/img\//g,
      fileFilter: /^.*\.md$/,
      dirFilter: /^Chapter.*$/,
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
       *    imgPrefix: url replacement prefix of images in the notes
       *    imgMatcher: image url in notes -  <img src="../img/
       */
      content: "https://api.github.com/repos/mrdrivingduck/linux-kernel-development-notes/contents/",
      commit: "https://api.github.com/repos/mrdrivingduck/linux-kernel-development-notes/commits?path=",
      imgPrefix: '<img src="https://raw.githubusercontent.com/mrdrivingduck/linux-kernel-development-notes/master/img/',
      imgMatcher: /<img\ssrc="\.\/img\//g,
      fileFilter: /^Chapter.*$/,
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
       *    imgPrefix: url replacement prefix of images in the notes
       *    imgMatcher: image url in notes -  <img src="../img/
       */
      content: "https://api.github.com/repos/mrdrivingduck/uc-os-ii-code-notes/contents/",
      commit: "https://api.github.com/repos/mrdrivingduck/uc-os-ii-code-notes/commits?path=",
      imgPrefix: '',
      imgMatcher: /<img\ssrc="\.\/img\//g,
      fileFilter: /^.*\.md$/,
      dirFilter: /^Chapter.*$/,
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
       *    imgPrefix: url replacement prefix of images in the notes
       *    imgMatcher: image url in notes -  <img src="../img/
       */
      content: "https://api.github.com/repos/mrdrivingduck/jdk-source-code-analysis/contents/",
      commit: "https://api.github.com/repos/mrdrivingduck/jdk-source-code-analysis/commits?path=",
      imgPrefix: '',
      imgMatcher: /<img\ssrc="\.\/img\//g,
      fileFilter: /^(Class|Abstract|Interface).*$/,
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
    },
    understanding_the_jvm: {
      /**
       * Understanding the JVM
       *    commit: notes commit record
       *    imgPrefix: url replacement prefix of images in the notes
       *    imgMatcher: image url in notes -  <img src="../img/
       */
      content: "https://api.github.com/repos/mrdrivingduck/understanding-the-jvm/contents/",
      commit: "https://api.github.com/repos/mrdrivingduck/understanding-the-jvm/commits?path=",
      // imgPrefix: '<img src="https://raw.githubusercontent.com/mrdrivingduck/understanding-the-jvm/master/img/',
      // imgMatcher: /<img\ssrc="\.\.\/img\//g,
      fileFilter: /^.*\.md$/,
      dirFilter: /^Part.*$/,
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
    }
  },
  emotion: {
    url: "https://api.github.com/repos/mrdrivingduck/emotions/contents/",
    fileFilter: /^[^.]*$/,
  }
};

export default {
  state
}
