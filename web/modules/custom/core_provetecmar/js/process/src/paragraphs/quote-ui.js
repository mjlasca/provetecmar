import { Services } from "./services";

/**
 * Class for ui quote
 */
export class QuoteUi {
  lines = null;
  itemsProducts = [];
  constructor(settings = null, products) {
    this.settings = settings ?? [];
    this.parameters = settings.parameters ?? [];
    this.app = document.querySelector('#quote-lines');
    this.addLine = document.querySelector('.table-actions');
    this.service = new Services();
    this.products = products;
    this.init();
  }

  init(){
    this.addLine.addEventListener('click', () => {
      this.app.appendChild(this.line(''));
    });
    console.log(this.settings);
    this.rfqs = this.settings.group_companies;
    this.deliveries = this.settings.deliveries;
    this.quote_settings = this.settings.quote_settings;
    this.assessment = this.settings.assessment;
    this.shipping_method = this.settings.shipping_method;
    this.container_type = this.settings.container_type;
    this.container_delivery = this.settings.container_delivery;
    
  }

  fieldSelect(props, options){
    const td = document.createElement('td');
    const sele = document.createElement('select');
    if (props) {
        Object.assign(sele, props);
    }
    Object.values(options).forEach((val) => {
      const option = document.createElement('option');
      option.value = val.tid;
      option.textContent  = val.name;
      sele.appendChild(option);
    });
    sele.addEventListener('change', (e) =>  this.products.calculate(e));
    td.appendChild(sele);
    return td;
  }

  tooltipInit(element, msg) {
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.textContent = msg;
    tooltip.style.display = 'none'; 
    document.body.appendChild(tooltip);
    element.addEventListener('mouseenter', (e) => {
        tooltip.style.left = e.pageX + 10 + 'px';
        tooltip.style.top = e.pageY + 10 + 'px';
        tooltip.style.display = 'block';
    });
    element.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
    });
    element.addEventListener('mousemove', (e) => {
        tooltip.style.left = e.pageX + 10 + 'px';
        tooltip.style.top = e.pageY + 10 + 'px';
    });
  }

  line(data){
    const tr = document.createElement('tr');
    tr.classList = ['line-product']
    const fieldCheck = this.fieldInput({'name':'field_check[]', 'type': 'checkbox'});
    fieldCheck.classList = ['td-check'];
    tr.append(fieldCheck);
    const fieldProduct = this.fieldInput({'name':'field_product[]', 'type': 'text'});
    tr.append(fieldProduct);
    const fieldCant = this.fieldInput({'name':'field_cant[]', 'type': 'number'});
    tr.append(fieldCant);
    const fieldWeight = this.fieldInput({ 'name': 'field_weight_total[]', 'type': 'number', 'readOnly':true});
    tr.append(fieldWeight);
    const fieldTotal = this.fieldInput({ 'name': 'field_total[]', 'type': 'number', 'readOnly':true});
    tr.append(fieldTotal);
    const fieldCompany = this.fieldSelect({'name' : 'field_company[]'}, this.rfqs);
    tr.append(fieldCompany);
    const fieldDelivery = this.fieldSelect({'name': 'field_delivery_region[]'}, this.deliveries)
    tr.append(fieldDelivery);
    const fieldTax = this.fieldInput({'name' : 'field_tax[]', 'type' : 'number', 'readOnly': true});
    tr.append(fieldTax);
    const fieldCost = this.fieldInput({'name' : 'field_cost[]', 'type' : 'number', 'readOnly': true});
    tr.append(fieldCost);
    const fieldTotalCost = this.fieldInput({'name' : 'field_total_cost[]', 'type' : 'number', 'readOnly': true});
    tr.append(fieldTotalCost);
    const fieldAssessment = this.fieldSelect({'name' : 'field_assessment[]'}, this.assessment);
    tr.append(fieldAssessment);
    const fieldLandedCost = this.fieldInput({'name' : 'field_landed_cost[]', 'type' : 'number'});
    tr.append(fieldLandedCost);
    const fieldShippingMethod = this.fieldSelect({'name' : 'field_shipping_method[]'}, this.shipping_method);
    tr.append(fieldShippingMethod);
    const fieldContainerType = this.fieldSelect({'name' : 'field_container_type[]'}, this.container_type);
    tr.append(fieldContainerType);
    const fieldContainerDelivery = this.fieldSelect({'name' : 'field_container_delivery[]'}, this.container_delivery);
    tr.append(fieldContainerDelivery);
    const btnRemove = document.createElement('button');
    btnRemove.classList = ['btn btn-remove']
    btnRemove.type = 'button';
    btnRemove.textContent = "🗑️";
    btnRemove.addEventListener('click', (e) => this.removeLine(e));
    tr.appendChild(btnRemove);
    return tr;
    /*return `<tr class="quote-line">
        <td><input type="text" name="field_product[]" class="form-input" /></td>
        <td><input type="number" name="field_cant[]" class="form-input" step="0.01" /></td>
        <td><input type="number" name="field_weight_total[]" class="form-input" step="0.01" /></td>
        <td><input type="number" name="field_total[]" class="form-input" readonly /></td>
        
        
        
        <td><input type="number" name="field_unit_sale[]" class="form-input" step="0.01" /></td>
        <td><input type="number" name="field_total_sale[]" class="form-input" step="0.01" readonly /></td>
        <td><input type="number" name="field_sale_factor[]" class="form-input" step="0.01" /></td>
        
        <td><select name="field_margin[]" class="form-select"></select></td>
        
        
        <td><select name="field_company[]" class="form-select"></select></td>
        
        
        
        <td><select name="field_incoterm[]" class="form-select"></select></td>
        <td><input type="text" name="field_delivery_time[]" class="form-input" /></td>
        <td class="center"><input type="checkbox" name="field_check[]" /></td>
        <td><input type="text" name="field_comments[]" class="form-input" /></td>
        <td class="center"><button type="button" class="btn btn-remove">🗑️</button></td>
      </tr>`;*/
  }

  fieldInput(props = null){
    const td = document.createElement('td');
    const inp = document.createElement('input');
    if (props) {
        Object.assign(inp, props);
    }
    td.appendChild(inp);
    if(props.name == 'field_product[]'){
      const sugges = document.createElement('div');
      sugges.classList = ['product-suggestion'];
      const ul = document.createElement('ul');
      sugges.appendChild(ul);
      td.classList = ['td-product'];
      td.appendChild(sugges);
      inp.addEventListener('input', (e) =>  this.autoComplete(e,ul));
      inp.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e, ul, this.itemsProducts));
    }
    inp.addEventListener('change', (e) =>  this.products.calculate(e));
    return td;
  }

  async autoComplete(e, contain){
    contain.innerHTML = '';
    const keyword = e.target.value;
    if(keyword.length < 3)
      return;
    try {
      const response = await fetch(
        `${this.service.urlBase}/get-product-quote/${keyword}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      this.renderSuggestions(contain, data.products, e.target)
    } catch (error) {
      console.error("Error en fetchData:", error);
    }
    
  }

  handleKeyboardNavigation(e, container) {
    
    const input = e.target;
    let currentIndex = -1;
    const items = container.querySelectorAll('li');
    if (e.repeat) {
        return; 
    }
    if (items.length === 0) return;
    container.closest('.product-suggestion').style.display = 'block';
    items.forEach((ele,k) => {
      if(ele.classList.contains('active')){
        currentIndex = k;
      }
    });
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        currentIndex = (currentIndex + 1) % items.length;
        break;

      case 'ArrowUp':
        e.preventDefault();
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        break;

      case 'Enter':
        e.preventDefault();
        if (currentIndex >= 0 && currentIndex < items.length) {
          input.value = items[currentIndex].textContent;
          input.dataset.nid = this.itemsProducts[currentIndex].nid;
          input.closest('tr').dataset.id = this.itemsProducts[currentIndex].nid;
          const resul = this.products.setLine(this.itemsProducts[currentIndex]);
          if(!resul.success){
            input.value = '';
            input.dataset.nid = '';
          }
          container.closest('.product-suggestion').style.display = 'none';
          container.innerHTML = '';
        }
        return;

      default:
        return;
    }
    items.forEach(li => li.classList.remove('active'));
    items[currentIndex].classList.add('active');
  }


  renderSuggestions(container, items, input) {
    this.itemsProducts = items;
    if (!items || items.length === 0) return;
    container.closest('.product-suggestion').style.display = 'block';
    items.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item.name; 
      li.classList.add('suggestion-item');
      li.addEventListener('click', () => {
        input.value = item.name;
        input.dataset.nid = item.nid;
        input.closest('tr').dataset.id = item.nid;
        const resul = this.products.setLine(item);
        if(!resul.success){
          input.value = '';
          input.dataset.nid = '';
        }
        container.innerHTML = '';
        container.closest('.product-suggestion').style.display = 'none';
      });
      container.appendChild(li);
    });
  }

  removeLine(e){
    if( !confirm('¿Está segur@ de eliminar esta líena?') )
      return;
    const tr = e.target.closest('tr');
    this.products.lines = this.products.lines.filter(item => item.nid == tr.dataset.id);
    tr.remove();
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
    if(!container.classList.contains("error-quote--content")){
      container.classList.add("error-quote--content");
      const td = container.querySelector('.td-check');
      this.tooltipInit(container, msg);
    }
  }
}
