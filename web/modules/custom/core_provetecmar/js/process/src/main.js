import { Calculate } from './calculate.js';
import { Utilities } from './utilities.js';
import { QuoteUi } from './quote-ui.js';
import "./style.css";

(function ($, Drupal) {
  Drupal.behaviors.Quote = {
    attach: function (context, settings) {
        let Calc = null;
        const $form = context.querySelector('#field-products-values');
        if($form){
          const QUi = new QuoteUi($form);
          QUi.succesWarning(context, settings.quote_settings);
          $form.addEventListener('click', (e) => {
            if(e.target && e.target.classList.contains('show-product')){
              Calc = new Calculate(e.target.closest('.paragraphs-subform'), e.target.getAttribute('data-nid'));
            }
          });
        }
        const $productFields = $(context).find('input[name*="field_product"]:not(.processed-by-js)');
        $productFields.each(function(e) {
            const $this = $(this);
            $this.addClass('processed-by-js');
            $this.on('autocompletechange', function(event, ui) {
            if (ui.item) {
                const entityId = ui.item.value;
                const nid = Utilities.getId(entityId);
                process(nid, event.target.closest('.paragraphs-subform'));
            }
            });
        });
        function process(nid, container){
          Calc = new Calculate(container, nid);
          Calc.process(nid);
        }

        window.addEventListener("focus", () => {
          if(Calc)
            Calc.process(Calc.nid);
        });
    },
  };
})(jQuery, Drupal);