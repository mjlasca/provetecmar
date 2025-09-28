import { Calculate } from './calculate.js';
import { Utilities } from './utilities.js';
import "./style.css";

(function ($, Drupal) {
  Drupal.behaviors.Quote = {
    attach: function (context, settings) {
      console.log(settings);
        const settCalc = {
          'quote_settings': settings.quote_settings ?? [],
          'parameters' : settings.parameters,
          'shipping' : settings.shipping
        };
        let Calc = new Calculate(null, null, settCalc);
        if(settings.validPro) Calc.ui.settings = settings.validPro;
        const params = context.querySelector('.quote-parameters');
        if(params){
          params.innerHTML = Calc.ui.parametersMarkup();
          const barSvg = params.querySelector('.quote-parameters--bar .toggle-btn');
          Calc.ui.collapseBar(params.querySelector('.quote-parameters--bar'));
          barSvg.addEventListener('click', () => {
            Calc.ui.collapseBar(params.querySelector('.quote-parameters--bar'));
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
                  Calc = new Calculate(event.target.closest('.paragraphs-subform'), nid, settCalc);
                  Calc.process();
                  settings.calc = Calc;
                  settings.validPro = Calc.ui.settings;
              }
            });
        });
        const $form = $(context).find('form');
        if(context && $form){
          Calc.ui.succesWarning(context);
          $form.on('click', (e) => {
            if(e.target && e.target.classList.contains('show-product')){
              Calc = settings.calc;
              if(Calc){
                Calc.containerRow = e.target.closest('.paragraphs-subform');
                Calc.nid = e.target.getAttribute('data-nid') ?? null;
                Calc.process();
              }
            }
          });
          $form.on('change', (e) => {
            if(e.target && e.target.name.includes('field_shipping_method')){
              Calc.ui.showContainer(e.target.closest('.paragraphs-subform'), e.target.value == 120);
            }
            if(e.target && e.target.name.indexOf('[field_product]') < 1 && e.target.classList.contains('form-element')){
              const nodeProduct = e.target.closest('.paragraphs-subform').querySelector('.show-product')
              if(nodeProduct){
                Calc = settings.calc;
                if(Calc){
                  Calc.containerRow = e.target.closest('.paragraphs-subform');
                  Calc.nid = nodeProduct.getAttribute('data-nid') ?? null;
                  Calc.process();
                }
              }
            }
          });
        }
        window.addEventListener("focus", () => {
          if(Calc){
            Calc.process();
          }
        });
    },
  };
})(jQuery, Drupal);