/**
 * @author Mr Dk.
 * @version 2019/11/06
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

  // Filter PDF file
  pdfFormatReg: /^.*\.pdf$/,

  // Filter PPT file
  pptFormatReg: /^.*\.ppt(x)?$/
};

export default {
  state
}
  