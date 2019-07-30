/**
 * @author Mr Dk.
 * @version 2019/07/30
 * @description
 *    Vuex store for saving regular expressions.
 */

const state = {
  // Filter only directories start with upper case character
  dirNameReg: /^[A-Z].*$/,
  
  // Filter only outline markdown files
  // These files start with 'Outline'
  outlineNameReg: /^Outline.*$/,

  // Image urls in markdown component
  imageUrlMatcher: [
    /^$/,
    /^$/, // image url in notes -  <img src="../img/
    /^$/, // image url in paper outlines - <img src="../../img/
  ]
};

export default {
  state
}
  