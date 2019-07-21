/**
 * @author Mr Dk.
 * @version 2019/07/21
 * @description
 *    Vuex store for saving current content component
 */

const state = {
  currentComponent: "ContentIndex"
};

const mutations = {
  
  setCurrentContent: function (state, { currentComponent }) {
    state.currentComponent = currentComponent;
  }

};

export default {
  state,
  mutations
}
  