import { FormQuote } from "./FormProducts.js";
import { Calculate } from "./paragraphs/calculate.js";
import { Utilities } from "./paragraphs/utilities.js";
import { Requests } from "./requests/Requests.js";
import "./style.css";

(function ($, Drupal, once) {
  Drupal.behaviors.Quote = {
    attach: function (context, settings) {
      console.log(settings.process);
      if(settings.process){
        const settCalc = {
          quote_settings: settings.quote_settings ?? [],
          parameters: settings.parameters,
          shipping: settings.shipping,
          container_delivery: settings.container_delivery,
          taxes: settings.taxes
        };
        let Calc = new Calculate(null, null, settCalc);
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
        $(context).on('click', '.paragraphs-subform [data-nid]', function (e) {
          console.log("C-------");
          console.log(formQuote);
          if(formQuote){
            formQuote.calc.containerRow = e.target.closest('.paragraphs-subform');
            formQuote.calc.nid = e.target.dataset.nid ?? null;
            formQuote.calc.process();
          }
        });
        $(context).on('change', '.paragraphs-subform input, .paragraphs-subform select', function (e) {
            if (e.target && e.target.name.includes("field_shipping_method")) {
              formQuote.ui.showContainer(
                e.target.closest(".paragraphs-subform"),
                e.target.value == 120
              );
            }
            if (
              e.target &&
              e.target.classList.contains("form-element")
            ) {
              const nodeProduct = e.target
                .closest(".paragraphs-subform");
              if (nodeProduct) {
                const nid = nodeProduct.querySelector('[data-nid]');
                if (formQuote.calc) {
                  formQuote.calc = new Calculate(nodeProduct, nid.dataset.nid, settCalc);
                  formQuote.calc.process();
                }
              }
            }
        });
        window.addEventListener("focus", () => {
          console.log("B-----");
          console.log(formQuote);
          if(formQuote){
            formQuote.calc.process();
          }
        });
      }else{
        const products = context.querySelector('#field-products-values');
        if(products){
          const fields = products.querySelectorAll('input, select');
          fields.forEach(el => {
            el.disabled = true;
            el.readonly = true;
          });
          const actions = products.querySelectorAll('.paragraphs-actions');
          actions.forEach(el => {
            el.remove();
          });
          const checks = products.querySelectorAll('.field--widget-boolean-checkbox');
          checks.forEach(el => {
            el.remove();
          });
        }
        const fieldActions = context.querySelector('.field-actions');
        if(fieldActions){
          fieldActions.remove();
        }
        const dropdown = context.querySelector('.paragraphs-dropdown');
        if(dropdown){
          dropdown.remove();
        }
        
      }
      
    },
  };
})(jQuery, Drupal, once);
