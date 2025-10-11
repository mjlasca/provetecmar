export class RequestsModal{
    constructor(container){
        this.container = container;
    }

    init(){
        if(this.container){
            const body = this.container.querySelector('.quote-modal--body');
            const head = this.container.querySelector('.quote-modal--head');
            head.innerHTML = '<strong>Enviar solicitudes</strong><span class="modal-head--close"><svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="#000" d="M195.2 195.2a64 64 0 0 1 90.496 0L512 421.504 738.304 195.2a64 64 0 0 1 90.496 90.496L602.496 512 828.8 738.304a64 64 0 0 1-90.496 90.496L512 602.496 285.696 828.8a64 64 0 0 1-90.496-90.496L421.504 512 195.2 285.696a64 64 0 0 1 0-90.496z"></path></g></svg></span>';
            const elForm = document.createElement('div');
            elForm.classList = ['quote-modal--form'];
            elForm.innerHTML = '<div class="form"></div>';
            body.appendChild(elForm);
            const butt = document.createElement('div');
            butt.classList = ['quote-modal--button'];
            butt.innerHTML = '<div class="msg-modal"></div><br><button class="modal-button" type="button">Confirmar envío</button>';
            body.appendChild(butt);
        }
        
    }

    showModal(){
        if(this.container.classList.contains('quote-hide')){
            this.container.classList.remove('quote-hide');
        }
    }

    hideModal(){
        if(!this.container.classList.contains('quote-hide')){
            this.container.classList.add('quote-hide');
        }
    }

}