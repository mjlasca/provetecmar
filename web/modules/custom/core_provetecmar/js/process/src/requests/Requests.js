import { RequestsModal } from "./RequestsModal.js";
import { RequestsUi } from "./RequestsUi.js";
import { SendController } from "./RequestsSendController.js";

export class Requests{

    products = [];
    constructor(container, providers, path){
        this.providers = providers;
        this.modal = new RequestsModal(container);
        this.modal.init();
        this.ui = new RequestsUi(container.querySelector('.form'),providers);
        this.service = new SendController('/send-request');
        this.buttonSubmit();
        this.init();
        this.path = path.currentPath;
        this.msg = document.querySelector('.msg-modal');
    }

    init(){
        const closeSpan = document.querySelector('.modal-head--close');
        const openModal = document.querySelector('.requests-send');
        openModal?.addEventListener('click', () => {
            if(this.validateSelected())
                this.modal.showModal();
        });
        closeSpan?.addEventListener('click', () => {
            this.ui.reset();
            this.msg.innerHTML =``;
            this.modal.hideModal();
        });
    }

    buttonSubmit(){
        const butt = document.querySelector('.modal-button');
        butt?.addEventListener('click', async (e) => {
            if(this.validateSelected() && this.products.length > 0){
                const res = confirm('¿Esta segur@ de enviar las solicitudes?');
                if(res){
                    const loaderSpin = document.querySelector('.loader-overlay');
                    if(loaderSpin)
                        loaderSpin.style.display = 'flex';
                    const dataSend = {
                        'node' : this.extractNumberFromPath(),
                        'providers' : this.ui.getSelected(),
                        'products' : this.products,
                    };
                    const rest = await this.service.send(dataSend);
                    
                    if(this.msg){
                        this.msg.innerHTML =`<p>${rest.msg}</p>`;
                        setTimeout(() => {
                            this.ui.reset();
                            this.modal.hideModal();
                            this.msg.innerHTML =``;
                        }, 2000);
                    }
                    if(loaderSpin)
                        loaderSpin.style.display = 'none';
                }
            }
        });
    }

    validateSelected(){
        this.getProducts();
        if(this.products.length < 1){
            alert("No hay productos seleccionados");
            return false;
        }
        return true;
    }

    getProducts(){
        this.products = [];
        const productsElement = document.querySelectorAll('[data-nid]');
        productsElement.forEach(product => {
            const paragraph = product.closest('.paragraphs-subform');
            const check = paragraph.querySelector('.form-type--checkbox input');
            if(check.checked && paragraph.querySelector('.field--name-field-cant input').value != ''){
                this.products.push({
                    'nid': product.getAttribute('data-nid'),
                    'cant': paragraph.querySelector('.field--name-field-cant input').value
                });
            }
        });
        return this.products;
    }

    extractNumberFromPath() {
        const m = this.path.match(/(\d+)/);
        return m ? parseInt(m[1], 10) : null;
    }
}