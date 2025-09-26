import { Calculate } from './calculate.js';
import { Utilities } from './utilities.js';
import { QuoteUi } from './quote-ui.js';
import "./style.css";

(function ($, Drupal) {
  Drupal.behaviors.Quote = {
    attach: function (context, settings) {
        let Calc = null;
        let QUi = new QuoteUi(settings.quote_settings);
        
        const $form = $(context).find('form');
        if($form){
            console.log(QUi.settings);
            QUi.succesWarning(context);
          $form.on('click', (e) => {
            if(e.target && e.target.classList.contains('show-product')){
              Calc = new Calculate(e.target.closest('.paragraphs-subform'), e.target.getAttribute('data-nid'));
            }
          });
          $form.on('change', (e) => {
            if(e.target && e.target.name.includes('field_shipping_method')){
              QUi.showContainer(e.target.closest('.paragraphs-subform'), e.target.value == 120);
            }
          });
        }
        /*const $form = context.querySelector('#field-products-values');
        if($form){
          const QUi = new QuoteUi($form);
          QUi.succesWarning(context, settings.quote_settings);
          $form.addEventListener('click', (e) => {
            if(e.target && e.target.classList.contains('show-product')){
              Calc = new Calculate(e.target.closest('.paragraphs-subform'), e.target.getAttribute('data-nid'));
            }
          });
          $form.addEventListener('change', (e) => {
            if(e.target && e.target.name.includes('field_shipping_method')){
              QUi.showContainer(e.target.closest('.paragraphs-subform'), e.target.value == 120);
            }
          });
        }*/
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
          QUi.settings = Calc.process(nid);
        }

        window.addEventListener("focus", () => {
          if(Calc)
            QUi.settings = Calc.process(Calc.nid);
        });
    },
  };
})(jQuery, Drupal);