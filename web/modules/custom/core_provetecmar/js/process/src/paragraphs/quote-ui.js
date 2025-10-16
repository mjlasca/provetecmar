/**
 * Class for ui quote
 */
export class QuoteUi {
  constructor(settings = null) {
    this.settings = settings.quote_settings ?? [];
    this.parameters = settings.parameters ?? [];
  }

  modalMarkup(src) {
    if (!this.form.querySelector("#modal-quote")) {
      const divModal = document.createElement("div");
      divModal.classList.add("overlay-modal");
      divModal.id = "modal-quote";
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

  linkProduct(nid, container, currency) {
    if (!container.querySelector(".show-product")) {
      const aElement = document.createElement("a");
      aElement.classList.add("show-product");
      aElement.setAttribute("target", "_blank");
      aElement.setAttribute("data-nid", nid);
      aElement.textContent = "+";
      aElement.href = `/node/${nid}/edit`;
      const divProduct = container.querySelector(".field--name-field-product");
      const paragraphsSubform = divProduct.closest('.paragraphs-subform');
      if(paragraphsSubform){
        paragraphsSubform.setAttribute('data-currency', currency);
        paragraphsSubform.setAttribute('data-node', nid);
      }
      divProduct.prepend(aElement);
    }
  }

  showModal(showProduct) {
    const nid = showProduct.getAttribute("data-nid");
    if (nid) {
      this.modalMarkup(`/node/${nid}/edit`);
    }
  }

  showContainer(container, show) {
    const conta = container.querySelector(".quote-container");
    const containerType = container.querySelector(
      '[name*="field_container_type"]'
    );
    const containerDelivery = container.querySelector(
      '[name*="field_container_delivery"]'
    );
    const qty = conta.querySelector('[name*="field_qty"]');
    if (!conta.classList.contains("quote-hide") && !show) {
      conta.classList.add("quote-hide");
      qty.removeAttribute("required");
    } else if (show) {
      if (container.querySelector(".error-quote--content"))
        container.querySelector(".error-quote--content").remove();
      conta.classList.remove("quote-hide");
      qty.setAttribute("required", true);
      qty.value = "";
      containerDelivery.value = "_none";
      containerType.value = "_none";
    }
  }

  succesWarning(context) {
    Object.values(this.settings).forEach((el) => {
      if (context.querySelector(`.valid-${el.nid}`)) {
        context
          .querySelector(`.valid-${el.nid}`)
          .closest(".paragraph-type--items")
          .classList.add(el.class);
      }
    });
  }

  validateProduct(dragCont, confirm, dataProduct) {
    const nid = dragCont
      .querySelector(".show-product")
      .getAttribute("data-nid");
    const index = this.settings.findIndex((item) => item.nid === nid);
    let classSet = "product-warning";
    if (dragCont.classList.contains("product-success"))
      dragCont.classList.remove("product-success");
    if (dragCont.classList.contains("product-warning")) {
      dragCont.classList.remove("product-warning");
      classSet = "product-success";
    }
    if (confirm) {
      dragCont.classList.add("product-success");
      classSet = "product-success";
    } else {
      dragCont.classList.add("product-warning");
      classSet = "product-warning";
    }
    if (index !== -1) this.settings[index].class = classSet;
    else{
      this.settings.push({ nid: nid, class: classSet , currency : { 'tid': dataProduct.currency, 'cost': 0 }});
    }
  }

  parametersMarkup(data) {
    const params = document.querySelector(".quote-parameters");
    if(params){
        let trms = "";
        const currencys = document.querySelectorAll('[data-currency]');
        const objCurrenc = [];
        currencys.forEach(el => {
          const input = el.querySelector('[name*="field_total"]');
          objCurrenc.push({
            'nid' : el.getAttribute('data-node'),
            'currency' : el.getAttribute('data-currency'),
            'costTotal' : input.value
          });
          const nameT = this.parameters.find(item => item.tid == el.getAttribute('data-currency') );
          if(nameT)
            input.previousElementSibling.textContent = `Total (${nameT.name})`;
        });
        this.settings = this.settings.map(obj => ({
          ...obj,
          currency: {
            ...obj.currency,
            cost: 0
          }
        }));
        Object.values(this.parameters).forEach((term) => {
            const resF = this.settings.find(item => item.currency.tid == term.tid);
            if(resF != undefined){
              const totalTid = objCurrenc.reduce((total, val) => {
                if(val.currency == term.tid){
                  return total + parseFloat(val.costTotal);
                }
                return total;
              }, 0);
              trms += `<p class="span-left"><small>(${term.factor})</small> <b>${term.name}</b></p>
                        <p class="span-${term.name}">
                            ${parseFloat(totalTid)}
                        </p>
                    `;
            }
        });
        params.innerHTML = `<div class="parameters-body">
                        
                        <div class="bar-left">
                            <div class="total-trm">${trms}</div>
                            <div class="quote-parameters--totals">
                                <div class="total-quote">
                                    <p class="span-left"><b>TOTAL COSTO: </b></p><p class="span-right">${ data.totals.cost ?? 0 } USD</p>
                                </div>
                                <div class="total-quote">
                                    <p class="span-left"><b>PESO TOTAL: </b></p><p class="span-right">${ data.totals.weight ?? 0 } kg</p>
                                </div>
                                <div class="total-quote">
                                    <p class="span-left"><b>TOTAL COTIZADO: </b></p><p class="span-right">${ data.totals.total ?? 0 } USD</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
    }
  }

  collapseBar(bar) {
    if (bar.classList.contains("collapse")) {
      bar.classList.remove("collapse");
    } else {
      bar.classList.add("collapse");
    }
  }

  showError(container, msg) {
    const divErr = container.querySelector(".form-type--checkbox");
    if (!divErr.querySelector(".error-quote--content")) {
      const dElement = document.createElement("div");
      dElement.classList.add("error-quote--content");
      dElement.innerHTML = `<p>${msg}</p>`;
      divErr.appendChild(dElement);
    }
  }
}
