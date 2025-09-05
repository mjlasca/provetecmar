(function ($, Drupal) {
  Drupal.behaviors.sendRequests = {
    attach: function (context) {
        const table = context.querySelector('.field-multiple-table');
        const submit = context.querySelector('input[name="op"]');
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
        const sendRequests = context.querySelector('#edit-field-requests-send-value');
        if(sendRequests){
            sendRequests.addEventListener('change', () => {
                if(checks(table) < 1){
                    alert("No hay productos seleccionados para enviar solicitudes");
                    sendRequests.checked = false;
                    return;
                }
                if(sendRequests.checked){
                    sendRequests.checked = confirm('Al habilitar el envío, cuando se guarde la cotización se enviarán las solicitudes de productos seleccionadas')
                    submit.click();
                }
                    
            });
        }
    },
  };
})(jQuery, Drupal);