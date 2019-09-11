/**
 * @author Mr Dk.
 * @version 2019/09/10
 * @description
 *    Vuex store for saving notes metadata
 */

const state = {
    notes_url: ""
  };
  
  const mutations = {

    setNotesUrl: function (state, { url }) {
        state.notes_url = url;
    }
  
  };
  
  export default {
    state,
    mutations
  }
  