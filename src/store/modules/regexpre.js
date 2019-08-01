/**
 * @author Mr Dk.
 * @version 2019/08/01
 * @description
 *    Vuex store for saving regular expressions.
 */

const state = {
  // Filter only directories start with upper case character
  dirNameReg: /^[A-Z].*$/,
  
  // Filter only outline markdown files
  // These files start with 'Outline'
  outlineNameReg: /^Outline.*$/,

  // Filter only markdown of different chapters
  chapterNameReg: /^Chapter.*$/,

  // Image urls in markdown component
  imageUrlMatcher: [
    /^$/,
    /<img\ssrc="\.\.\/img\//g, // image url in notes -  <img src="../img/
    /<img\ssrc="\.\.\/\.\.\/img\//g, // image url in paper outlines - <img src="../../img/
    /<img\ssrc="\.\/img\//g, // image url in how-linux-works - <img src="./img/
    /<img\ssrc="\.\/img\//g, // image url in linux-kernel-comments - <img src="./img/
  ]
};

export default {
  state
}
  