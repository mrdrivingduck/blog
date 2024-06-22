import { defineUserConfig } from "vuepress";
import { defaultTheme } from "@vuepress/theme-default";
import { docsearchPlugin } from "@vuepress/plugin-docsearch";
import { navbarEn, sidebarEn } from "./configs";
import { viteBundler } from "@vuepress/bundler-vite";

export default defineUserConfig({
  base: "/blog/",
  head: [["link", { rel: "icon", href: "/blog/images/favicon.jpg" }]],
  bundler: viteBundler(),

  locales: {
    "/": {
      lang: "en-US",
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
