import { FormQuote } from "./FormProducts.js";
import { Requests } from "./requests/Requests.js";
import "./style.css";

(function ($, Drupal, once) {
  Drupal.behaviors.Quote = {
    attach: function (context, settings) {
      const form = context.querySelector('.node-form');
      const detailsProducts = context.querySelector('#edit-group-insumos');
      const tabs = context.querySelectorAll('.horizontal-tab-button');
      if (tabs) {
        tabs.forEach(tab => {
          tab.addEventListener('click', (e) => {
            form.style.maxWidth = "1420px"
            if (detailsProducts.style.display != 'none') {
              form.style.width = "4870px";
              form.style.maxWidth = "none";
            }
          });
        });
      }
      let formObj = null;
      if (context) {
        const tableParam = document.querySelector('#field-trm-s-values tbody');
        if (tableParam)
          tableParam.classList.add('tbody-flex');
      }
      if (settings.process == -1) {
        const tabLines = document.querySelector('.quote-app');
        if (tabLines) {
          tabLines.innerHTML = '<div class="msg-draft"><h3>La cotización debe ser creada para crear o editar líneas...</h3></div>';
        }
        return;
      }
      once("quote-form", ".quote-app", context).forEach((e) => {
        formObj = new FormQuote(e, settings);
      });
      once('quote-behavior', '.quote-modal', context).forEach(function (element) {
        const requests = new Requests(element, settings.providers_list, settings.path);
      });
    },
  };
})(jQuery, Drupal, once);
