(function ($, Drupal) {
  Drupal.behaviors.Quote = {
    attach: function (context) {
        const $productFields = $(context).find('input[name*="field_product"]:not(.processed-by-js)');
        $productFields.each(function(e) {
            const $this = $(this);
            $this.addClass('processed-by-js');
            $this.on('autocompletechange', function(event, ui) {
            if (ui.item) {

                console.log(event.target);
                const entityId = ui.item.value; 
                console.log(`El ID de la entidad es: ${entityId}`);
                console.log(getId(entityId));
            }
            });
        });
        function getId(texto) {
            const match = texto.match(/\((\d+)\)/);
            return match ? parseInt(match[1], 10) : null;
        }
    },
  };
})(jQuery, Drupal);