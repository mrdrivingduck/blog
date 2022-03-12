const { navbar, sidebar } = require("./configs");

module.exports = {
  lang: "zh-CN",
  // sidebar: false,
  // navbar: false,

  base: "/blog/",

  head: [["link", { rel: "icon", href: "/blog/images/favicon.jpg" }]],

  locales: {
    "/": {
      lang: "en",
      title: "Mr Dk.'s Blog",
      description:
        "A Tiffany-twisted perfectionist. 🍬",
    }
  },

  themeConfig: {
    logo: "/images/avatar.jpg",
    repo: "https://github.com/mrdrivingduck/blog",

    editLink: false,
    docsDir: 'docs',

    // whether to enable light/dark mode

    locales: {
      "/": {
        selectLanguageName: "English",

        // page meta
        editLinkText: "Edit this page on GitHub",

        // navbar
        navbar: navbar.en,

        // sidebar
        sidebarDepth: 1,
        sidebar: sidebar.en,
      },
    },
  },

  extendsMarkdown: (md) => {
    // md.use(require('markdown-it-include'))
    // md.use(require('markdown-it-footnote'))
    // md.use(require('markdown-it-sub'))
    // md.use(require('markdown-it-sup'))
    md.linkify.set({ fuzzyEmail: false })
  },

  plugins: [
    [
      "@vuepress/plugin-search",
      {
        locales: {
          "/": {
            placeholder: "Search",
          },
        },
        maxSuggestions: 12,
      },
    ],
    [
      "@renovamen/vuepress-plugin-baidu-tongji", {
        "id": "1958503623668fcdb06542fb2aa21fe2"
      }
    ],
    // [
    //   "@renovamen/vuepress-plugin-reading-time", {
    //     includes: ["/docs/.*"]
    //   }
    // ],
    // [
    //   "vuepress-plugin-giscus", {
    //     repo: "mrdrivingduck/blog",
    //     repoId: "MDEwOlJlcG9zaXRvcnkxOTM5OTk3MDQ=",
    //     category: "Announcements",
    //     categoryId: "DIC_kwDOC5AzWM4CODgJ",
    //     theme: "dark_dimmed",
    //   }
    // ]
  ],
};
