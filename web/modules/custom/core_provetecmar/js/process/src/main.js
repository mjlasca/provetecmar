import { FormQuote } from "./FormProducts.js";
import { Calculate } from "./paragraphs/calculate.js";
import { Utilities } from "./paragraphs/utilities.js";
import { Requests } from "./requests/Requests.js";
import "./style.css";

(function ($, Drupal, once) {
  Drupal.behaviors.Quote = {
    attach: function (context, settings) {
      const settCalc = {
        quote_settings: settings.quote_settings ?? [],
        parameters: settings.parameters,
        shipping: settings.shipping,
        container_delivery: settings.container_delivery,
      };
      let Calc = new Calculate(null, null, settCalc);
      const $form = $(context).find("#field-products-values");
      let formQuote = new FormQuote(context, settCalc);
      formQuote.calc = Calc;
      formQuote.init();

      once('quote-behavior', '.quote-modal', context).forEach(function (element) {
        const requests = new Requests(element, settings.providers_list, settings.path);
      });

      const $productFields = $(context).find(
          'input[name*="field_product"]:not(.processed-by-js)'
      );
      $productFields.each(function (e) {
        const $this = $(this);
        $this.addClass("processed-by-js");
        $this.on("autocompletechange", function (event, ui) {
          if (ui.item) {
            const entityId = ui.item.value;
            const nid = Utilities.getId(entityId);
            formQuote.calc = new Calculate(
              event.target.closest(".paragraphs-subform"),
              nid,
              settCalc
            );
            formQuote.calc.process();
          }
        });
      });
      
      $form.on('change', '.paragraphs-subform input, .paragraphs-subform select', function (e) {
        
      });
      
      window.addEventListener("focus", () => {
          console.log("testestt");
          if(formQuote){
            formQuote.calc.process();
          }
        });
      
    },
  };
})(jQuery, Drupal, once);
