/**
 * @author Mr Dk.
 * @version 2019/07/05
 * @description
 *    Vuex store for saving paper-outline directory metadata.
 */

const state = {
  outline_url: ""
};

const mutations = {
  
  setOutlineUrl: function (state, { url }) {
    state.outline_url = url;
  }

};

export default {
  state,
  mutations
}
