const { navbar, sidebar } = require("./configs");

module.exports = {
  lang: "zh-CN",
  // sidebar: false,
  // navbar: false,

  base: "/blog/",

  head: [["link", { rel: "icon", href: "/images/favicon.jpg" }]],

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
    // [
    //   "@vuepress/plugin-search",
    //   {
    //     locales: {
    //       "/": {
    //         placeholder: "搜索",
    //       },
    //       "/en/": {
    //         placeholder: "Search",
    //       },
    //     },
    //   },
    // ],
    // [
    //   '@renovamen/vuepress-plugin-katex',
    //   {
    //     throwOnError: false,
    //     errorColor: '#cc0000'
    //   }
    // ],
    // [
    //   "@renovamen/vuepress-plugin-mermaid"
    // ]
  ],
};
