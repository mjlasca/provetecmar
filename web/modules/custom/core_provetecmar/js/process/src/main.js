import { FormQuote } from "./FormProducts.js";
import { Calculate } from "./paragraphs/calculate.js";
import { QuoteUi } from "./paragraphs/quote-ui.js";
import { Utilities } from "./paragraphs/utilities.js";
import { Requests } from "./requests/Requests.js";
import "./style.css";

(function ($, Drupal, once) {
  Drupal.behaviors.Quote = {
    attach: function (context, settings) {
      let formObj = null;
      once("quote-form", ".quote-app", context).forEach((e) => {
        formObj = new FormQuote(e, settings);
      });
    },
  };
})(jQuery, Drupal, once);
