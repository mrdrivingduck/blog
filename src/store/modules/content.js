/**
 * @author Mr Dk.
 * @version 2019/11/29
 * @description
 *    Vuex store for saving current content component
 */

const state = {
  currentComponent: "ContentIndex",
  compIndex: 0
};

const mutations = {
  
  setCurrentContent: function (state, { currentComponent }) {
    state.currentComponent = currentComponent;
  },

  setCurrentAsideIndex: function (state, { index }) {
    state.compIndex = index;
  }

};

export default {
  state,
  mutations
}
  