import { Services } from "./services";

/**
 * Class for ui quote
 */
export class QuoteUi {
  lines = null;
  itemsProducts = [];
  succ = null;
  fals = null;
  btnRequests = null;
  constructor(settings = null, products) {
    this.settings = settings ?? [];
    this.parameters = settings.parameters ?? [];
    this.app = document.querySelector('#quote-lines');
    this.addLine = document.querySelector('.add-line');
    this.service = new Services();
    this.products = products;
    this.init();
  }

  init() {
    this.addLine?.addEventListener('click', () => {
      this.setLine({});
    });
    this.rfqs = this.settings.group_companies;
    this.deliveries = this.settings.deliveries;
    this.quote_settings = this.settings.quote_settings;
    this.assessment = this.settings.assessment;
    this.shipping_method = this.settings.shipping_method;
    this.container_type = this.settings.container_type;
    this.container_delivery = this.settings.container_delivery;
    this.incoterms = this.settings.incoterms;
    this.margin = this.settings.margin;
    this.currencies = this.settings.currencies;
    this.brand_line = this.settings.brand_line;
    //span check th prmary
    this.succ = document.querySelector('.check-succ');
    if (!this.settings.process)
      this.succ.innerHTML = '<input type="checkbox" >';
    this.succ.addEventListener('change', (e) => this.manageCheck(e));
    this.btnRequests = document.querySelector('.requests-send');
    if (this.btnRequests)
      this.btnRequests.style.display = 'none';
  }

  fieldSelect(props, options) {
    const td = document.createElement('td');
    const sele = document.createElement('select');
    if (this.settings.process)
      props['disabled'] = true;
    if (props) {
      Object.assign(sele, props);
    }
    Object.values(options).forEach((val) => {
      const option = document.createElement('option');
      option.value = val.tid;
      option.textContent = val.name;
      if (props.value && val.tid == props.value)
        option.selected = true;
      sele.appendChild(option);
    });
    if (props.name == 'field_shipping_method[]') {
      sele.addEventListener('change', (e) => this.showContainer(sele.closest('tr'), e.target.value));
    }
    sele.addEventListener('change', (e) => this.products.calculate(e.target));
    td.appendChild(sele);
    return td;
  }

  tooltipInit(element, msg) {
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.textContent = msg;
    tooltip.style.display = 'none';
    element.appendChild(tooltip);
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

  tooltipRemove(container) {
    container.querySelector('.custom-tooltip').remove();
  }

  setLine(data) {
    this.app.appendChild(this.line(data));
    this.counter();
  }

  line(data) {
    const tr = document.createElement('tr');
    tr.classList = ['line-product']
    const fieldCheck = this.fieldInput({ 'name': 'field_check[]', 'type': 'checkbox', 'value': '1', 'checked': data.field_check == 1 ? true : false });
    fieldCheck.classList = ['td-check'];
    tr.append(fieldCheck);
    const fieldProduct = this.fieldInput({ 'name': 'field_product[]', 'type': 'text', 'autocomplete': 'off', 'value': data.field_product ?? '' });
    tr.append(fieldProduct);
    const fieldCant = this.fieldInput({ 'name': 'field_cant[]', 'type': 'text', 'value': data.field_cant ?? '' });
    tr.append(fieldCant);
    const fieldCurrency = this.fieldSelect({ 'name': 'field_currency_line[]', 'value': data.field_currency_line ?? '' }, this.currencies);
    tr.append(fieldCurrency);
    const fieldWeightUnit = this.fieldInput({ 'name': 'field_weight_unit[]', 'type': 'text', 'readOnly': true, 'value': data.weight ?? '' });
    tr.append(fieldWeightUnit);
    const fieldWeight = this.fieldInput({ 'name': 'field_weight_total[]', 'type': 'text', 'readOnly': true, 'value': data.field_weight_total ?? '' });
    tr.append(fieldWeight);
    const fieldCostUnit = this.fieldInput({ 'name': 'field_unitcost[]', 'type': 'text', 'readOnly': true, 'value': data.cost_unit ?? '' });
    tr.append(fieldCostUnit);
    const fieldTotal = this.fieldInput({ 'name': 'field_total[]', 'type': 'text', 'readOnly': true, 'value': data.field_total ?? '' });
    tr.append(fieldTotal);
    const fieldCompany = this.fieldSelect({ 'name': 'field_company[]', 'value': data.field_company ?? '' }, this.rfqs);
    tr.append(fieldCompany);
    const fieldDelivery = this.fieldSelect({ 'name': 'field_delivery_region[]', 'value': data.field_delivery_region ?? '' }, this.deliveries)
    tr.append(fieldDelivery);
    const fieldIncoterm = this.fieldSelect({ 'name': 'field_incoterm[]', 'value': data.field_incoterm ?? '' }, this.incoterms);
    tr.append(fieldIncoterm);
    const fieldBrand = this.fieldSelect({ 'name': 'field_brand[]', 'value': data.field_brand ?? '' }, this.brand_line);
    tr.append(fieldBrand);
    const fieldTax = this.fieldInput({ 'name': 'field_tax[]', 'type': 'text', 'readOnly': true, 'value': data.field_taxs ?? '' });
    tr.append(fieldTax);
    const fieldCost = this.fieldInput({ 'name': 'field_cost[]', 'type': 'text', 'readOnly': true, 'value': data.field_cost ?? '' });
    tr.append(fieldCost);
    const fieldTotalCost = this.fieldInput({ 'name': 'field_total_cost[]', 'type': 'text', 'readOnly': true, 'value': data.field_total_cost ?? '' });
    tr.append(fieldTotalCost);
    const fieldAssessment = this.fieldSelect({ 'name': 'field_assessment[]', 'value': data.field_assessment ?? '' }, this.assessment);
    tr.append(fieldAssessment);
    const fieldMargin = this.fieldSelect({ 'name': 'field_margin[]', 'value': data.field_margin ?? '' }, this.margin);
    tr.append(fieldMargin);
    const fieldLandedCost = this.fieldInput({ 'name': 'field_landed_cost[]', 'type': 'text', 'value': data.field_landed_cost ?? '' });
    tr.append(fieldLandedCost);
    const fieldShippingMethod = this.fieldSelect({ 'name': 'field_shipping_method[]', 'value': data.field_shipping_method ?? '' }, this.shipping_method);
    tr.append(fieldShippingMethod);
    const fieldContainerType = this.fieldSelect({ 'name': 'field_container_type[]', 'value': data.field_container_type ?? '', 'disabled': true }, this.container_type);
    fieldContainerType.classList.add('td-mar');
    tr.append(fieldContainerType);
    const fieldQty = this.fieldInput({ 'name': 'field_qty[]', 'type': 'text', 'value': data.field_qty ?? '', 'disabled': true });
    fieldQty.classList.add('td-mar');
    tr.append(fieldQty);
    const fieldContainerDelivery = this.fieldSelect({ 'name': 'field_container_delivery[]', 'value': data.field_container_delivery ?? '', 'disabled': true }, this.container_delivery);
    fieldContainerDelivery.classList.add('td-mar');
    tr.append(fieldContainerDelivery);
    const fieldUnitSale = this.fieldInput({ 'name': 'field_unit_sale[]', 'type': 'text', 'readOnly': true, 'value': data.field_unit_sale ?? '' });
    tr.append(fieldUnitSale);
    const fieldTotalSale = this.fieldInput({ 'name': 'field_total_sale[]', 'type': 'text', 'readOnly': true, 'value': data.field_total_sale ?? '' });
    tr.append(fieldTotalSale);
    const fieldSaleFactor = this.fieldInput({ 'name': 'field_sale_factor[]', 'type': 'text', 'readOnly': true, 'value': data.field_sale_factor ?? '' });
    tr.append(fieldSaleFactor);
    const fieldDeliveryTime = this.fieldInput({ 'name': 'field_delivery_time[]', 'type': 'text', 'value': data.field_delivery_time ?? '' });
    tr.append(fieldDeliveryTime);
    const fieldDeliveryTimeClient = this.fieldInput({ 'name': 'field_delivery_time_client[]', 'type': 'text', 'value': data.field_delivery_time_client ?? '' });
    tr.append(fieldDeliveryTimeClient);
    const fieldComments = this.fieldInput({ 'name': 'field_comments[]', 'type': 'text', 'value': data.field_comments ?? '' });
    tr.append(fieldComments);
    if (data.field_shipping_method && data.field_shipping_method == 120) {
      this.showContainer(tr, 120);
    }
    const tdBtn = document.createElement('td');
    tdBtn.classList = ['td-small td-delete'];
    const btnRemove = document.createElement('button');
    if (!this.settings.process)
      tdBtn.appendChild(btnRemove);
    btnRemove.classList = ['btn btn-remove']
    btnRemove.type = 'button';
    btnRemove.textContent = "🗑️";
    btnRemove.addEventListener('click', (e) => this.removeLine(e));
    tr.appendChild(tdBtn);
    if (data.nid) {
      tr.dataset.id = data.nid;
      fieldProduct.querySelector('input').dataset.nid = data.nid;
    }
    if (data.nid && !this.settings.process) {
      this.products.calculate(fieldProduct.querySelector('input'));
    }
    return tr;
  }

  fieldInput(props = null) {
    const td = document.createElement('td');
    const inp = document.createElement('input');
    if (this.settings.process)
      props['disabled'] = true;
    if (props) {
      Object.assign(inp, props);
    }
    td.appendChild(inp);
    if (props.name == 'field_product[]') {
      const sugges = document.createElement('div');
      sugges.classList = ['product-suggestion'];
      const ul = document.createElement('ul');
      sugges.appendChild(ul);
      td.classList = ['td-product'];
      td.appendChild(sugges);
      inp.addEventListener('input', (e) => this.autoComplete(e, ul));
      inp.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e, ul, this.itemsProducts));
      inp.addEventListener('dblclick', (e) => window.open(`/node/${e.target.dataset.nid}/edit`, '_blank'))
    }
    if (props.type == 'number') {
      inp.step = 0.01;
    }
    if (props.type == 'checkbox') {
      inp.addEventListener('change', (e) => this.requestsShow());
    }

    inp.addEventListener('change', (e) => this.products.calculate(e.target));
    return td;
  }

  requestsShow(check = false) {
    this.btnRequests.style.display = 'none';
    const checks = document.querySelectorAll('input[name="field_check[]"]');
    let ch = 0;
    checks.forEach(el => {
      if (el.checked) {
        ch++;
        return;
      }
    });
    if (ch > 0 || check) {
      this.btnRequests.style.display = 'block';
    }
  }

  async autoComplete(e, contain) {
    contain.innerHTML = '';
    const keyword = e.target.value;
    if (keyword.length < 3)
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
    items.forEach((ele, k) => {
      if (ele.classList.contains('active')) {
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
          const resul = this.products.setLine(this.itemsProducts[currentIndex], input.closest('tr').dataset.id);
          input.closest('tr').dataset.id = this.itemsProducts[currentIndex].nid;
          if (!resul.success) {
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
        const resul = this.products.setLine(item, input.closest('tr').dataset.id);
        input.closest('tr').dataset.id = item.nid;
        if (!resul.success) {
          input.value = '';
          input.dataset.nid = '';
        }
        container.innerHTML = '';
        container.closest('.product-suggestion').style.display = 'none';
      });
      container.appendChild(li);
    });
  }

  removeLine(e) {
    if (!confirm('¿Está segur@ de eliminar esta líena?'))
      return;
    const tr = e.target.closest('tr');
    this.products.lines = this.products.lines.filter(item => item.nid != tr.dataset.id);
    tr.remove();
    this.counter();
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
      if (paragraphsSubform) {
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

  showContainer(container, val) {
    const containerType = container.querySelector(
      '[name*="field_container_type"]'
    );
    const containerDelivery = container.querySelector(
      '[name*="field_container_delivery"]'
    );
    const qty = container.querySelector('[name*="field_qty"]');
    containerType.disabled = true;
    containerDelivery.disabled = true;
    qty.disabled = true;
    if (val == 120) {
      containerType.disabled = false;
      containerDelivery.disabled = false;
      qty.disabled = false;
    } else {
      containerType.value = "";
      containerDelivery.value = "";
      qty.value = "";
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
    else {
      this.settings.push({ nid: nid, class: classSet, currency: { 'tid': dataProduct.currency, 'cost': 0 } });
    }
  }

  parametersMarkup(data) {
    const params = document.querySelector(".quote-parameters");
    if (params) {
      let trms = "";
      const currencys = document.querySelectorAll('[data-currency]');
      const objCurrenc = [];
      currencys.forEach(el => {
        const input = el.querySelector('[name*="field_total"]');
        objCurrenc.push({
          'nid': el.getAttribute('data-node'),
          'currency': el.getAttribute('data-currency'),
          'costTotal': input.value
        });
        const nameT = this.parameters.find(item => item.tid == el.getAttribute('data-currency'));
        if (nameT)
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
        if (resF != undefined) {
          const totalTid = objCurrenc.reduce((total, val) => {
            if (val.currency == term.tid) {
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
                                    <p class="span-left"><b>TOTAL COSTO: </b></p><p class="span-right">${data.totals.cost ?? 0} USD</p>
                                </div>
                                <div class="total-quote">
                                    <p class="span-left"><b>PESO TOTAL: </b></p><p class="span-right">${data.totals.weight ?? 0} kg</p>
                                </div>
                                <div class="total-quote">
                                    <p class="span-left"><b>TOTAL COTIZADO: </b></p><p class="span-right">${data.totals.total ?? 0} USD</p>
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
    if (!container.classList.contains("error-quote--content")) {
      container.classList.add("error-quote--content");
      this.tooltipInit(container, msg);
    }
  }

  counter() {
    const count = this.app.querySelectorAll('.td-check .count-line');
    count.forEach(element => {
      element.remove();
    });
    const lines = this.app.querySelectorAll('.td-check');
    lines.forEach((element, x) => {
      const span = document.createElement('span');
      span.classList = ['count-line'];
      element.closest('tr').dataset.num = (x + 1);
      span.textContent = (x + 1);
      element.prepend(span);
    });
  }

  manageCheck(e) {
    const status = e.target.checked;
    const checks = this.app.querySelectorAll('input[type="checkbox"]');
    if (checks.length < 1)
      return;
    checks.forEach(element => {
      element.checked = status;
    });
    this.requestsShow(status);
  }

  incotermsMatriz(tr, cell) {
    const assessment = tr.querySelector('[name*="field_assessment"]');
    const shipping = tr.querySelector('[name*="field_shipping_method"]');
    if (!assessment && !shipping)
      return;
    cell = cell.toLowerCase();
    assessment.disabled = false;
    shipping.disabled = false;
    switch (cell) {
      case 'exwexw':
      case 'fobfob':
      case 'cifcif':
      case 'dapdap':
      case 'ddpddp':
        assessment.value = 0;
        shipping.value = '';
        assessment.disabled = true;
        shipping.disabled = true;
        break;
      case 'fobexw':
      case 'ciffob':
      case 'cifexw':
      case 'dapexw':
      case 'dapcif':
      case 'dapfob':
        assessment.disabled = true;
        break;
    }
    this.showContainer(tr, shipping.value);
  }

}
