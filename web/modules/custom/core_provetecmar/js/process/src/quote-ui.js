/**
 * Class for ui quote
 */
export class QuoteUi {
    constructor(settings) {
        this.settings = settings.quote_settings ?? [];
        this.parameters = settings.quote_settings.parameters ?? [];
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
        Object.values(this.settings).forEach((el) => {
            if(context.querySelector(`.valid-${el.nid}`)){
                context.querySelector(`.valid-${el.nid}`).closest('.paragraph-type--items').classList.add(el.class);
            }
        });
    }

    validateProduct(dragCont, confirm){
        const nid = dragCont.querySelector('.show-product').getAttribute('data-nid');
        const index = this.settings.findIndex(item => item.nid === nid);
        let classSet = 'product-warning';
        if(dragCont.classList.contains('product-success'))
            dragCont.classList.remove('product-success');
        if(dragCont.classList.contains('product-warning')){
            dragCont.classList.remove('product-warning');
            classSet = 'product-success';
        }
        if(confirm){
            dragCont.classList.add('product-success');
            classSet = 'product-success';
        }
        else{
            dragCont.classList.add('product-warning');
            classSet = 'product-warning';
        }
        if(index !== -1)
            this.settings[index].class = classSet;
        else
            this.settings.push({ nid: nid, class: classSet });
        
    }

    parametersMarkup(){
        let trms = "";
        Object.values(this.parameters).forEach(term => {
            trms += `<p class="span-left"><small>(${term.factor})</small> <b>${term.name}</b></p>
                     <p class="span-${term.name}">
                        $ 6.277 
                     </p>
                    `;
        });
        return `<div class="quote-parameters--bar">
                    <div class="bar-left">
                        <div class="total-trm">${trms}</div>
                        <div class="quote-parameters--totals">
                            <div class="total-quote">
                                <p class="span-left"><b>TOTAL COSTO</b></p><p class="span-right">$ 6.277 USD</p>
                            </div>
                            <div class="total-quote">
                                <p class="span-left"><b>PESO TOTAL</b></p><p class="span-right">19,50 kg</p>
                            </div>
                            <div class="total-quote">
                                <p class="span-left"><b>TOTAL COTIZADO</b></p><p class="span-right">$ 9.114,15 USD</p>
                            </div>
                        </div>
                    </div>
                    <div class="bar-right">

                    </div>
                </div>
                `;
    }
    

}
