/**
 * @author Mr Dk.
 * @version 2019/07/14
 * @description
 *    Vuex store for saving theme information
 */

const state = {
  themes: [
    {
      name: "Light",
      background: "#ffffff",
      highlight: "atom-one-light"
    },
    {
      name: "Dark",
      background: "#282c34",
      highlight: "atom-one-dark"
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
  