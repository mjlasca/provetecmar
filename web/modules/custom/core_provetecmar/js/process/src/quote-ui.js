/**
 * Class for ui quote
 */
export class QuoteUi {
    constructor(settings) {
        this.settings = settings ?? [];
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
    
    linkProduct(nid, container) {
        if(!container.querySelector('.show-product')){
            const aElement = document.createElement("a");
            aElement.classList.add('show-product');
            aElement.setAttribute('target','_blank');
            aElement.setAttribute('data-nid',nid);
            aElement.textContent = "+";
            const divProduct = container.querySelector('.field--name-field-product');
            divProduct.prepend(aElement);
        }
    }

    showModal(showProduct){
        const nid = showProduct.getAttribute('data-nid');
        if(nid){
            this.modalMarkup(`/node/${nid}/edit`);
        }
    }

    showContainer(container, show){
        const conta =  container.querySelector('.quote-container');
        const qty = conta.querySelector('[name*="field_qty"]');
        if(!conta.classList.contains('quote-hide') && !show){
            conta.classList.add('quote-hide');
            qty.removeAttribute('required');
        }else if( show ){
            conta.classList.remove('quote-hide');
            qty.setAttribute('required',true);
        }
    }

    succesWarning(context){
        Object.entries(this.settings).forEach((k,el) => {
            if(context.querySelector(`[data-nid="${k}"]`)){
                console.log(`[data-nid="${k}"]`);
                console.log(context.querySelector(`[data-nid="${k}"]`));
                context.querySelector(`[data-nid="${k}"]`).closest('.paragraph-type--items').classList.add(el.class);
            }
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

    static validateProduct(dragCont, sett){
        const nid = dragCont.querySelector('.show-product');
        if(dragCont.classList.contains('product-success'))
            dragCont.classList.remove('product-success');
        if(dragCont.classList.contains('product-warning')){
            dragCont.classList.remove('product-warning');
            sett.push({'class':'product-warning', 'id': nid.getAttribute('data-nid')})
        }
        if(this.dataProduct.weight > 0 && this.dataProduct.cost_unit > 0 && this.dataProduct.provider != ''){
            dragCont.classList.add('product-success');
            sett.push({'class':'product-success', 'id': nid.getAttribute('data-nid')})
        }
        else{
            dragCont.classList.add('product-warning');
            sett.push({'class':'product-warning', 'id': nid.getAttribute('data-nid')})
        }
        console.log(sett);
        return sett;
    }

    cloneParagraph(conta){
        const baseProduct = conta.querySelector(".paragraph-type--items");
        console.log(baseProduct);
        if (!baseProduct) {
        console.warn("No hay producto base en el contenedor.");
        return;
        }
        const newProduct = baseProduct.cloneNode(true);
        conta.append(newProduct);
    }


}
