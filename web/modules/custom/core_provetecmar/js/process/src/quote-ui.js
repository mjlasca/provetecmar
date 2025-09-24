/**
 * Class for ui quote
 */
export class QuoteUi {
    constructor(form) {
        this.form = form;
    }

    modalMarkup(src) {
        if(!this.form.querySelector('#modal-quote')){
            const divModal = document.createElement("div");
            divModal.classList.add('overlay-modal');
            divModal.id = 'modal-quote';
            divModal.innerHTML = `
            <div class="content-modal">
            <iframe
                class="modal-iframe"
                src="${src}"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowfullscreen
                title="Producto embebido">
            </iframe>
            </div>`;
            this.form.appendChild(divModal);
        }
    }


    showModal(showProduct){
        console.log(showProduct.getAttribute('data-nid'));
        const nid = showProduct.getAttribute('data-nid');
        this.modalMarkup(`/node/${nid}/edit`);
    }

    succesWarning(context, settings){
        settings.forEach(el => {
            context.querySelector('#'+el.id).closest('.paragraph-type--items').classList.add(el.class);
        });
        /*this.containerRow.querySelector('.show-product').href = `/node/${nid}/edit`;
        const dragCont = this.containerRow.closest('.paragraph-type--items');
        
        console.log(this.dataProduct);
        if(dragCont.classList.contains('product-success'))
            dragCont.classList.remove('product-success');
        if(dragCont.classList.contains('product-warning'))
            dragCont.classList.remove('product-warning');
        if(this.dataProduct.weight > 0 && this.dataProduct.cost_unit > 0 && this.dataProduct.provider != '')
            dragCont.classList.add('product-success');
        else{
            dragCont.classList.add('product-warning');
        }*/
    }

}
