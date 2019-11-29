/**
 * @author Mr Dk.
 * @version 2019/11/29
 * @description
 *    Vuex store for saving regular expressions.
 */

const state = {
  // Filter PDF file
  pdfFormatReg: /^.*\.pdf$/,

  // Filter PPT file
  pptFormatReg: /^.*\.ppt(x)?$/
};

export default {
  state
}
  