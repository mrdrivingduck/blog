/**
 * @author Mr Dk.
 * @version 2021/01/01 🎆
 * @description Vuex store for saving theme information
 */

const state = {
  themes: [
    {
      name: "Light",
      background: "#ffffff",
      content: {
        highlight: "github-gist",
        markdown: "markdown-body"
      },
      aside: {
        backgroundColor: "#ffffff", // 背景色 - 白色
        textColor: "#000000", // 文字颜色 - 黑色
        activeTextColor: "#9567e4" // 选中文字颜色 - 基佬紫 😂
      },
      card: {
        backgroundColor: "#ffffff",
        textColor: "#000000"
      },
      backTopColor: "#ffffff",
      buttonStyle: "light"
    },
    {
      name: "Dark",
      background: "#282c34",
      content: {
        highlight: "obsidian",
        markdown: "markdown-body-dark",
      },
      aside: {
        backgroundColor: "#282c34", // 背景色 - 深灰
        textColor: "#ffffff", // 文字颜色 - 白色
        activeTextColor: "#ffd04b" // 选中文字颜色 - 黄黄的 😁
      },
      card: {
        backgroundColor: "#2d2d2d",
        textColor: "#ffffff"
      },
      backTopColor: "#3d3d3d",
      buttonStyle: "dark"
    }
  ],
  currentThemeIndex: new Date().getSeconds() % 2
};

const mutations = {
  
  setCurrentTheme(state, { themeIndex }) {
    state.currentThemeIndex = themeIndex;
  }

};

export default {
  state,
  mutations
}
  