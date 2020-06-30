/**
 * @author Mr Dk.
 * @version 2020/06/30
 * @description
 *    Vuex store for saving current content component
 */

const state = {
  // GitHub API v4 entry point
  // apiv4: "https://api.github.com/graphql",
  apiv4: "https://koera.vultr.mrdrivingduck.cn/blog/apiv4",

  baseUrl: "https://mrdrivingduck.github.io/blog/#",
  
  query: {
    /**
     * User info
     * Commit info
     * Deployment info
     * Emotions
     */
    user: `query { 
            user(login: "mrdrivingduck") { name, location, bio, company },
            io: repository(name: "blog", owner: "mrdrivingduck") {
              deployments(last: 1) {
                nodes {
                  createdAt, creator { login, url },
                  commit { message, committedDate, committer { user { name, url } } }
                }
              },
              ref(qualifiedName: "master") {
                target {
                  ... on Commit {
                    history(first: 1) {
                      edges {
                        node {
                          oid, message, committedDate
                          committer { user { name, url } }
                        }
                      }
                    }
                  }
                }
              }
              object(expression: "master:package.json") {
                ... on Blob { oid, byteSize, text }
              }
            },
            emotions: repository(name: "emotions", owner: "mrdrivingduck") {
              object(expression: "master:") {
                ... on Tree {
                  entries {
                    name
                  }
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
                      name, type, object { ...getDirectory }
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
              uc_os_ii_code_notes: repository(name: "uc-os-ii-code-notes", owner: "mrdrivingduck") {
                object(expression: "master:") {
                  ...getDirectory
                }
              }
              understanding_the_jvm: repository(name: "understanding-the-jvm", owner: "mrdrivingduck") {
                object(expression: "master:") {
                  ...getDirectory
                }
              }
              redis_implementation_notes: repository(name: "redis-implementation-notes", owner: "mrdrivingduck") {
                object(expression: "master:") {
                  ...getDirectory
                }
              }
            }

            fragment getDirectory on Tree {
              entries { name, type, oid }
            }`,
    notelist: `query { 
                repository(name: "<repo>", owner: "mrdrivingduck") {
                  object(expression: "master:<path>") {
                    ... on Tree {
                      entries {
                        name, type, oid
                        object {
                          ... on Blob {
                            byteSize
                          }
                        }
                      }
                    }
                  }
                }
              }`,
    outline_list: `query { 
                    repository(name: "<repo>", owner: "mrdrivingduck") {
                      object(expression: "master:<path>") {
                        ... on Tree {
                          entries {
                            name
                            object {
                              ... on Tree {
                                entries {
                                  name, oid
                                  object {
                                    ... on Blob {
                                      byteSize
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }`,
    markdown: `query { 
                repository(name: "<repo>", owner: "mrdrivingduck") {
                  object(expression: "master:<path>") {
                    ... on Blob {
                      oid, byteSize, text
                    }
                  }
                  defaultBranchRef {
                    target {
                      ... on Commit {
                        history(path: "<path>") {
                          nodes {
                            oid, committedDate, author { user { name } }
                          }
                        }
                      }
                    }
                  }
                }
              }`,

    notes: {
      /**
       * notes content
       *    commit: notes commit record
       *    imgPrefix: url replacement prefix of images in the notes
       *    imgMatcher: image url in notes -  <img src="../img/
       */
      // content: "https://api.github.com/repos/mrdrivingduck/notes/contents/",
      // commit: "https://api.github.com/repos/mrdrivingduck/notes/commits?path=",
      link: "https://github.com/mrdrivingduck/notes",
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
      // content: "https://api.github.com/repos/mrdrivingduck/paper-outline/contents/",
      // commit: "https://api.github.com/repos/mrdrivingduck/paper-outline/commits?path=",
      link: "https://github.com/mrdrivingduck/paper-outline",
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
      // content: "https://api.github.com/repos/mrdrivingduck/how-linux-works-notes/contents/",
      // commit: "https://api.github.com/repos/mrdrivingduck/how-linux-works-notes/commits?path=",
      link: "https://github.com/mrdrivingduck/how-linux-works-notes",
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
      // content: "https://api.github.com/repos/mrdrivingduck/linux-kernel-comments-notes/contents/",
      // commit: "https://api.github.com/repos/mrdrivingduck/linux-kernel-comments-notes/commits?path=",
      link: "https://github.com/mrdrivingduck/linux-kernel-comments-notes",
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
      // content: "https://api.github.com/repos/mrdrivingduck/linux-kernel-development-notes/contents/",
      // commit: "https://api.github.com/repos/mrdrivingduck/linux-kernel-development-notes/commits?path=",
      link: "https://github.com/mrdrivingduck/linux-kernel-development-notes",
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
    uc_os_ii_code_notes: {
      /**
       * μC/OS-II notes content
       *    commit: notes commit record
       *    imgPrefix: url replacement prefix of images in the notes
       *    imgMatcher: image url in notes -  <img src="../img/
       */
      // content: "https://api.github.com/repos/mrdrivingduck/uc-os-ii-code-notes/contents/",
      // commit: "https://api.github.com/repos/mrdrivingduck/uc-os-ii-code-notes/commits?path=",
      link: "https://github.com/mrdrivingduck/uc-os-ii-code-notes",
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
      // content: "https://api.github.com/repos/mrdrivingduck/jdk-source-code-analysis/contents/",
      // commit: "https://api.github.com/repos/mrdrivingduck/jdk-source-code-analysis/commits?path=",
      link: "https://github.com/mrdrivingduck/jdk-source-code-analysis",
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
      // content: "https://api.github.com/repos/mrdrivingduck/understanding-the-jvm/contents/",
      // commit: "https://api.github.com/repos/mrdrivingduck/understanding-the-jvm/commits?path=",
      // imgPrefix: '<img src="https://raw.githubusercontent.com/mrdrivingduck/understanding-the-jvm/master/img/',
      // imgMatcher: /<img\ssrc="\.\.\/img\//g,
      link: "https://github.com/mrdrivingduck/understanding-the-jvm",
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
    },
    redis_implementation_notes: {
      /**
       * Redis implementation notes
       *    commit: notes commit record
       *    imgPrefix: url replacement prefix of images in the notes
       *    imgMatcher: image url in notes -  <img src="../img/
       */
      // content: "https://api.github.com/repos/mrdrivingduck/redis-implementation-notes/contents/",
      // commit: "https://api.github.com/repos/mrdrivingduck/redis-implementation-notes/commits?path=",
      // imgPrefix: '<img src="https://raw.githubusercontent.com/mrdrivingduck/redis-implementation-notes/master/img/',
      // imgMatcher: /<img\ssrc="\.\.\/img\//g,
      link: "https://github.com/mrdrivingduck/redis-implementation-notes",
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
    },
    emotions: {
      query: `query { 
                emotions: repository(name: "emotions", owner: "mrdrivingduck") {
                  object(expression: "master:<date>") {
                    ... on Blob {
                      text
                    }
                  }
                }
              }`,
      fileFilter: /^[^.]*$/
    }
  }
};

export default {
  state
}
