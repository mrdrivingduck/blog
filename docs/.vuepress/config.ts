import { defineUserConfig } from "@vuepress/cli";
import { docsearchPlugin } from "@vuepress/plugin-docsearch";
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
    logo: "/images/avatar.png",
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
  ],
});
