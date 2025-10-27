import { FormQuote } from "./FormProducts.js";
import "./style.css";

(function ($, Drupal, once) {
  Drupal.behaviors.Quote = {
    attach: function (context, settings) {
      let formObj = null;
      if(settings.process == -1)
      {
        const tabLines = document.querySelector('.quote-app');
        if(tabLines){
          tabLines.innerHTML = '<div class="msg-draft"><h3>La cotización debe ser creada...</h3></div>';
        }
        return;
      }
      once("quote-form", ".quote-app", context).forEach((e) => {
        formObj = new FormQuote(e, settings);
      });
    },
  };
})(jQuery, Drupal, once);
