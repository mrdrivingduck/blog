import { defineUserConfig } from "@vuepress/cli";
import { docsearchPlugin } from "@vuepress/plugin-docsearch";
import { baiduTongjiPlugin } from "@renovamen/vuepress-plugin-baidu-tongji";
import { defaultTheme } from "@vuepress/theme-default";
import { navbarEn, sidebarEn } from "./configs";

export default defineUserConfig({
  lang: "zh-CN",

  base: "/blog/",

  head: [["link", { rel: "icon", href: "/blog/images/favicon.jpg" }]],

  locales: {
    "/": {
      lang: "en",
      title: "Mr Dk.'s Blog",
      description: "A Tiffany-twisted perfectionist. 🍬",
    },
  },

  theme: defaultTheme({
    logo: "/images/avatar.jpg",
    repo: "https://github.com/mrdrivingduck/blog",

    editLink: false,
    docsDir: "docs",

    // whether to enable light/dark mode

    locales: {
      "/": {
        selectLanguageName: "English",

        // page meta
        editLinkText: "Edit this page on GitHub",

        // navbar
        navbar: navbarEn,

        // sidebar
        sidebarDepth: 2,
        sidebar: sidebarEn,
      },
    },
  }),

  // extendsMarkdown: (md) => {
  // md.use(require('markdown-it-include'))
  // md.use(require('markdown-it-footnote'))
  // md.use(require('markdown-it-sub'))
  // md.use(require('markdown-it-sup'))
  // md.linkify.set({ fuzzyEmail: false })
  // },

  plugins: [
    docsearchPlugin({
      appId: "Y0FX1JHUAF",
      apiKey: "508aac0c126f42fca77dcf28bc027dc8",
      indexName: "mrdrivingduck",
      locales: {
        "/": {
          placeholder: "Search Documentation",
        },
      },
    }),
    baiduTongjiPlugin({ id: "1958503623668fcdb06542fb2aa21fe2" }),
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
});
