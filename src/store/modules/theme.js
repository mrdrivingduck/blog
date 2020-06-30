/**
 * @author Mr Dk.
 * @version 2020/06/27
 * @description
 *    Vuex store for saving theme information
 */

const state = {
  themes: [
    {
      name: "Light",
      background: "#ffffff",
      content: {
        highlight: "atom-one-light",
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
      buttonStyle: "no-preference: light; light: dark; dark: light;"
    },
    {
      name: "Dark",
      background: "#282c34",
      content: {
        highlight: "atom-one-dark",
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
      buttonStyle: "no-preference: dark; light: light; dark: dark;"
    }
  ],
  currentThemeIndex: 0
};

const mutations = {
  
  setCurrentTheme: function (state, { themeIndex }) {
    state.currentThemeIndex = themeIndex;
  }

};

export default {
  state,
  mutations
}
  