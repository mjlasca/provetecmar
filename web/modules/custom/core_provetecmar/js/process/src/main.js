import { Calculate } from './calculate.js';
import { Utilities } from './utilities.js';
import { QuoteUi } from './quote-ui.js';
import "./style.css";

(function ($, Drupal) {
  Drupal.behaviors.Quote = {
    attach: function (context, settings) {
        let Calc = null;
        let QUi = new QuoteUi(settings);
        const params = context.querySelector('.quote-parameters');
        if(params){
          params.innerHTML = QUi.parametersMarkup();
          const barSvg = params.querySelector('.quote-parameters--bar .toggle-btn');
          QUi.collapseBar(params.querySelector('.quote-parameters--bar'));
          barSvg.addEventListener('click', () => {
            QUi.collapseBar(params.querySelector('.quote-parameters--bar'));
          });
        }
        const $form = $(context).find('form');
        if(context && $form){
            QUi.succesWarning(context);
          $form.on('click', (e) => {
            if(e.target && e.target.classList.contains('show-product')){
              Calc = new Calculate(e.target.closest('.paragraphs-subform'), e.target.getAttribute('data-nid'));
              Calc.settings = QUi.settings;
            }
          });
          $form.on('change', (e) => {
            if(e.target && e.target.name.includes('field_shipping_method')){
              QUi.showContainer(e.target.closest('.paragraphs-subform'), e.target.value == 120);
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
          console.log(QUi.settings);
          Calc.settings = QUi.settings;
          Calc.process(nid);
        }
        window.addEventListener("focus", () => {
          if(Calc){
            Calc.process(Calc.nid);
          }
        });
    },
  };
})(jQuery, Drupal);