/**
 * @author Mr Dk.
 * @version 2019/07/07
 * @description
 *    Vuex store for saving current content component
 */

const state = {
  currentComponent: "ContentIndex"
};

const mutations = {
  
  setCurrentContent: function (state, { currentComp }) {
    state.currentComponent = currentComp;
  }

};

export default {
  state,
  mutations
}
  