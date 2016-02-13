import { BasePage } from 'assets/js/pages/BasePage.js';
import { Tooltips } from 'modules/tooltips/Tooltips.js';

export const TooltipsPage = {

  __proto__: BasePage,

  init() {
    this.__proto__.init();
    Tooltips.tooltip({togglerSelector: `.js-tooltip-toggle`, tooltipSelector: `.js-tooltip`});
  },

};