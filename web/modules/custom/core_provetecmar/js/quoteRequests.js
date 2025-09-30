(function ($, Drupal) {
  Drupal.behaviors.sendRequests = {
    attach: function (context) {
        const table = context.querySelector('.field-multiple-table');
        const submit = context.querySelector('input[name="op"]');
        const sendRequests = context.querySelector('#edit-field-requests-send-value');
        const buttonSend = context.querySelector('#send-request');
        const loaderSpin = context.querySelector('.loader-overlay');
        const totalInput = context.querySelectorAll('input[name*="[field_total]"]');
        const weightInput = context.querySelectorAll('input[name*="[field_weight_total]"]');
        const factCost = context.querySelectorAll('[name*="field_landed_cost"]');
        const costUnit = context.querySelectorAll('[name*="field_cost"]');
        const vrUnit = context.querySelectorAll('[name*="field_unit_sale"]');
        const vrTotal = context.querySelectorAll('[name*="field_total_sale"]');
        const factSale = context.querySelectorAll('[name*="field_sale_factor"]');
        const taxCo = context.querySelectorAll('[name*="field_tax"]');

        setReadOnly(totalInput);
        setReadOnly(weightInput);
        setReadOnly(factCost);
        setReadOnly(costUnit);
        setReadOnly(vrUnit);
        setReadOnly(vrTotal);
        setReadOnly(factSale);
        setReadOnly(taxCo);

        if(buttonSend){
            buttonSend.addEventListener('click', function(){
                sendRequests.click();
            });
        }
        function setReadOnly(content) {
            if(content){
                content.forEach(element => {
                    element.readOnly = true;        
                });
            }
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

    },
  };
})(jQuery, Drupal);