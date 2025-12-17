
import { FormQuote } from "../FormProducts";
import { QuoteUi } from "./quote-ui";
import { Services } from "./services";


/**
 * Clas for utilities quote
 */
export class Calculate {
  constructor(containerRow, nid, settings, products) {
    this.containerRow = containerRow;
    this.dataProduct = null;
    this.parametersQuote = settings.taxes;
    this.nid = nid;
    this.shipping = settings.shipping;
    this.customs = settings.container_delivery;
    this.formQuote = products;
    this.ui = this.formQuote.ui;
  }

  weightTotal() {
    const fieldCant = this.containerRow.querySelector('[name*="field_cant"]');
    const fieldWeight = this.containerRow.querySelector(
      '[name*="field_weight_total"]'
    );
    if (fieldCant && fieldCant.value != '' && this.dataProduct.weight)
      fieldWeight.value =
        parseFloat(this.dataProduct.weight) * parseFloat(fieldCant.value);
    else fieldWeight.value = 0;
  }

  costTotal() {
    const fieldCant = this.containerRow.querySelector('[name*="field_cant"]');
    const fieldTotal = this.containerRow.querySelector('[name*="field_total"]');
    if (fieldCant.value != '' && this.dataProduct.cost_unit != null) {
      fieldTotal.value =
        parseFloat(this.dataProduct.cost_unit) * parseFloat(fieldCant.value);
      const upd = this.formQuote.lines.find(item => item.nid == this.nid);
    }
    else fieldTotal.value = 0;
  }

  taxCalculate() {
    const rfq = this.containerRow.querySelector('[name*="field_company"]');
    const region = this.containerRow.querySelector(
      '[name*="field_delivery_region"]'
    );
    this.containerRow.querySelector('[name*="field_tax"]').value = 0;
    if (rfq && region && rfq.value > 0 && region.value > 0) {
      if (this.parametersQuote) {
        const tax = this.parametersQuote.find(
          (item) => item.rfq === rfq.value && item.region === region.value
        );
        if (tax) {
          this.containerRow.querySelector('[name*="field_tax"]').value =
            tax.tax;
        }
      }
    }
  }

  vrCosttUsd() {
    let result = this.dataProduct.cost_unit ?? 0;
    const trm = this.getTrm();
    if (trm == undefined) {
      return;
    }
    if (result > 0) {
      result = parseFloat(result / trm.factor);
      const tax = this.containerRow.querySelector('[name*="field_tax"]');
      if (tax && tax.value != "") result = result * (1 + tax.value / 100);
    }
    this.containerRow.querySelector('[name*="field_cost"]').value =
      result.toFixed(2);

    const fieldCant = this.containerRow.querySelector('[name*="field_cant"]');
    if (fieldCant && fieldCant.value != "") {
      const costTotal = this.containerRow.querySelector('[name*="field_total_cost"]');
      const costTotalTrm = this.containerRow.querySelector('[name*="field_total"]');
      costTotal.value =
        parseFloat(result * fieldCant.value).toFixed(2);
    }
  }

  landedCostFactor() {
    const cost = this.containerRow.querySelector('[name*="field_cost"]');
    const assessment = this.containerRow.querySelector(
      '[name*="field_assessment"]'
    );
    const landed = this.containerRow.querySelector(
      '[name*="field_landed_cost"]'
    );
    let result = 0;
    landed.value = 0;
    if (cost && cost.value > 0) {
      const shipp = this.getShipping();
      console.log("shipp", shipp);
      if (shipp != undefined && shipp.hasOwnProperty('type_delivery')) {
        if (shipp.type_delivery == 'aer') {
          let optionSelect = 0;
          if (assessment && assessment.value != '') {
            optionSelect = assessment.options[assessment.selectedIndex];
            optionSelect = optionSelect.textContent;
          }
          result = this.dataProduct.weight * shipp.cost;
          result = parseFloat(cost.value) + parseFloat(result);
          result = result * ((1 + parseFloat(optionSelect) / 100) / cost.value);
          if (landed)
            landed.value = result.toFixed(2);
        }
        else {
          if (shipp.type_delivery == 'loc') {
            result = 1 + (parseFloat(shipp.cost) / 100);
            landed.value = result.toFixed(2);
          }
          if (shipp.type_delivery == 'mar') {
            result = parseFloat(shipp.cost);
            landed.value = result.toFixed(2);
          }
        }
        if (shipp.type_delivery == 'defa')
          landed.value = 1;
      }

    }
  }

  getTrm() {
    return this.ui.parameters.find(
      (item) => item.tid == parseInt(this.dataProduct.currency)
    );
  }

  getShipping() {
    if (this.containerRow.classList.contains('error-quote--content')) {
      this.containerRow.classList.remove('error-quote--content');
      this.ui.tooltipRemove(this.containerRow);
    }
    let res = { 'type_delivery': 'defa' };
    const delivery = this.containerRow.querySelector(
      '[name*="field_delivery_region"]'
    );
    const shippingMethod = this.containerRow.querySelector(
      '[name*="field_shipping_method"]'
    );
    if (
      delivery &&
      shippingMethod &&
      delivery.value > 0 &&
      shippingMethod.value > 0
    ) {
      res = this.shipping.find(
        (item) =>
          item.origin == delivery.value &&
          item.shipping_method == shippingMethod.value
      );
    }
    if (res == undefined)
      res = { 'type_delivery': 'defa', 'cost': 0 };

    if (
      delivery &&
      shippingMethod &&
      delivery.value > 0 &&
      res != undefined &&
      res.hasOwnProperty('type_delivery') &&
      res.type_delivery == 'mar'
    ) {
      const containerType = this.containerRow.querySelector(
        '[name*="field_container_type"]'
      );
      const containerDelivery = this.containerRow.querySelector(
        '[name*="field_container_delivery"]'
      );
      const qty = this.containerRow.querySelector('[name*="field_qty"]');
      const objRes = this.shipping.find(
        (item) =>
          item.dimension == containerType.value &&
          item.origin == delivery.value &&
          item.shipping_method == shippingMethod.value
      );
      res = { 'cost': 0, 'type_delivery': 'mar' };
      if (
        containerType.value > 0 &&
        containerDelivery.value > 0 &&
        qty &&
        qty.value != ""
      ) {
        const totalUsd = this.containerRow.querySelector(
          '[name*="field_total_cost"]'
        );
        const assessment = this.containerRow.querySelector(
          '[name*="field_assessment"]'
        );
        if (totalUsd && objRes != undefined) {

          let optionSelect = 0;
          if (assessment && !assessment.disabled) {
            optionSelect = assessment.options[assessment.selectedIndex];
            optionSelect = optionSelect.textContent;
          }
          const shipping = objRes.cost * qty.value;
          const shipExw = parseFloat(totalUsd.value) + parseFloat(shipping);
          const asse = shipExw * (parseFloat(optionSelect) / 100);
          const customsGet = this.customs.find(
            (item) => item.tid == parseInt(containerDelivery.value)
          );
          if (customsGet) {
            const customs = shipExw * (objRes.customs / 100);
            const localDelivery =
              shipping * (parseFloat(customsGet.shipping_method) / 100);
            const landedCost = localDelivery + customs + asse + shipExw;
            res = { 'cost': landedCost / parseFloat(totalUsd.value), 'type_delivery': 'mar' };
          }
        } else {
          this.ui.showError(
            this.containerRow,
            "La información del contenedor no está completa"
          );
        }
      } else {
        this.ui.showError(
          this.containerRow,
          "La información del contenedor no está completa"
        );
      }
    }
    return res;
  }

  vrUnitUsd() {
    const cant = this.containerRow.querySelector('[name*="field_cant"]');
    const factCost = this.containerRow.querySelector('[name*="field_landed_cost"]');
    const costUnit = this.containerRow.querySelector('[name*="field_cost"]');
    const vrUnit = this.containerRow.querySelector('[name*="field_unit_sale"]');
    const vrTotal = this.containerRow.querySelector('[name*="field_total_sale"]');
    const factSale = this.containerRow.querySelector('[name*="field_sale_factor"]');
    const margin = this.containerRow.querySelector('[name*="field_margin"]');
    let optionMargin = 0;
    if (margin)
      optionMargin = margin.options[margin.selectedIndex];
    let vrUnitRes = 0
    if (factCost && costUnit)
      vrUnitRes = (parseFloat(factCost.value) * parseFloat(costUnit.value)) / (1 - (parseFloat(optionMargin.textContent) / 100));
    vrUnit.value = vrUnitRes.toFixed(2);
    vrTotal.value = (parseFloat(cant.value) * vrUnitRes).toFixed(2);
    factSale.value = (parseFloat(vrUnitRes) / parseFloat(costUnit.value)).toFixed(2);
  }

  async handleGetProduct() {
    this.dataProduct = await this.services.nodeProductService();
    const linkProduct = this.containerRow.querySelector(".show-product");
    if (linkProduct) {
      linkProduct.href = `/node/${this.nid}/edit`;
    }
    else {
      this.ui.linkProduct(this.nid, this.containerRow, this.dataProduct.currency);
    }
    this.validState();
  }


  updateSettings(context) {
    const nids = context.querySelectorAll('[data-nid]');
    let arrNid = [];
    if (nids) {
      nids.forEach(el => {
        arrNid.push(el.getAttribute('data-nid'));
      });
    }
    const restUpd = this.ui.quote_settings.filter(obj => arrNid.includes(obj.nid));
    this.ui.quote_settings = restUpd;
    this.ui.parametersMarkup(this.formQuote.totalResults());
    return this.ui.quote_settings;
  }

  process() {
    if (this.containerRow && this.nid) {
      this.costTotal();
      this.weightTotal();
      this.taxCalculate();
      this.vrCosttUsd();
      this.landedCostFactor();
      this.vrUnitUsd();
      /*
      this.ui.parametersMarkup(this.formQuote.totalResults());*/
    }
  }

  validState() {
    const dragCont = this.containerRow.closest(".paragraph-type--items");
    if (
      this.dataProduct.weight > 0 &&
      this.dataProduct.cost_unit > 0
    ) {
      this.ui.validateProduct(dragCont, true, this.dataProduct);
    } else {
      this.ui.validateProduct(dragCont, false, this.dataProduct);
    }
  }
}
