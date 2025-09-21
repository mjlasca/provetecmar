(function ($, Drupal, once) {
  Drupal.behaviors.sendRequests = {
    attach: function (context) {
        const table = context.querySelector('.field-multiple-table');
        const submit = context.querySelector('input[name="op"]');
        const sendRequests = context.querySelector('#edit-field-requests-send-value');
        const buttonSend = context.querySelector('#send-request');
        const loaderSpin = context.querySelector('.loader-overlay');
        const totalInput = context.querySelectorAll('input[name*="[field_total]"]');
        const weightInput = context.querySelectorAll('input[name*="[field_weight_total]"]');

        totalInput.forEach(input => {
            input.readOnly = true;
        });

        weightInput.forEach(input => {
            input.readOnly = true;
        });

        if(buttonSend){
            buttonSend.addEventListener('click', function(){
                sendRequests.click();
            });
        }
        function checks(content) {
            const lines = content.querySelectorAll('.form-checkbox');
            let checkCount = 0
            if(lines){
                lines.forEach(check => {
                    if(check.checked)
                        checkCount++;
                });
            }
            return checkCount;
        }
        
        if(sendRequests){
            sendRequests.addEventListener('change', () => {
                if(checks(table) < 1){
                    alert("No hay productos seleccionados para enviar solicitudes");
                    sendRequests.checked = false;
                    return;
                }
                if(sendRequests.checked){
                    sendRequests.checked = confirm('Al habilitar el envío, cuando se guarde la cotización se enviarán las solicitudes de productos seleccionadas')
                    if(sendRequests.checked){
                        loaderSpin.style.display = 'flex';
                        submit.click();
                    }
                        
                }
                    
            });
        }


      const $productFields = $(context).find('input[name*="field_product"]:not(.processed-by-js)');

      // Aplica el comportamiento a cada uno de los campos encontrados.
      $productFields.each(function() {
        const $this = $(this);
        
        // Agrega una clase para marcarlo como procesado.
        $this.addClass('processed-by-js');

        // Adjunta el evento autocompletechange.
        $this.on('autocompletechange', function(event, ui) {
          if (ui.item) {
            const entityId = ui.item.value; 
            console.log(`El ID de la entidad es: ${entityId}`);
          }
        });
      });
    
    },
  };
})(jQuery, Drupal, once);