
import { FormQuote } from "../FormProducts";
import { QuoteUi } from "./quote-ui";
import { Services } from "./services";
import { Utilities } from "./utilities";

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

  weightTotal(indexLine) {
    const fieldWeight = this.containerRow.querySelector(
      '[name*="field_weight_total"]'
    );
    const fieldWeightUnit = this.containerRow.querySelector(
      '[name*="field_weight_unit"]'
    );
    const fieldCant = this.containerRow.querySelector(
      '[name*="field_cant"]'
    );
    this.formQuote.lines[indexLine].field_cant = fieldCant.value;
    this.formQuote.lines[indexLine].field_weight_total = this.formQuote.lines[indexLine].field_cant * this.dataProduct.weight;
    fieldWeight.value = Utilities.formatNumber(this.formQuote.lines[indexLine].field_weight_total);
    fieldWeightUnit.value = this.dataProduct.weight;
  }

  costTotal(indexLine) {
    const fieldTotal = this.containerRow.querySelector('[name*="field_total"]');
    const fieldCostUnit = this.containerRow.querySelector('[name*="field_unitcost"]');
    this.formQuote.lines[indexLine].field_total = this.formQuote.lines[indexLine].field_cant * this.dataProduct.cost_unit;
    this.formQuote.lines[indexLine].field_unitcost = this.dataProduct.cost_unit;
    fieldTotal.value = Utilities.formatNumber(this.formQuote.lines[indexLine].field_total);
    fieldCostUnit.value = Utilities.formatNumber(this.dataProduct.cost_unit);
  }

  taxCalculate(indexLine) {
    this.formQuote.lines[indexLine].field_company = this.containerRow.querySelector('[name*="field_company"]').value;
    this.formQuote.lines[indexLine].field_delivery_region = this.containerRow.querySelector('[name*="field_delivery_region"]').value;
    const rfq = this.formQuote.lines[indexLine].field_company;
    const region = this.formQuote.lines[indexLine].field_delivery_region;
    if (rfq && region) {
      if (this.parametersQuote) {
        const tax = this.parametersQuote.find(
          (item) => item.rfq === rfq && item.region === region
        );
        if (tax) {
          this.formQuote.lines[indexLine].field_tax = tax.tax;
        }
      }
    }
    this.containerRow.querySelector('[name*="field_tax"]').value = Utilities.formatNumber(this.formQuote.lines[indexLine].field_tax);
  }

  vrCosttUsd(indexLine) {
    let result = this.dataProduct.cost_unit ?? 0;
    const trm = this.getTrm();
    if (trm == undefined) {
      return;
    }
    this.formQuote.lines[indexLine].name_currency = trm.name;
    if (result > 0) {
      result = parseFloat(result / trm.factor);
      const tax = this.formQuote.lines[indexLine].field_tax;
      result = result * (1 + tax / 100);
    }
    this.formQuote.lines[indexLine].field_cost = result;
    this.containerRow.querySelector('[name*="field_cost"]').value = Utilities.formatNumber(this.formQuote.lines[indexLine].field_cost);

    const fieldCant = this.formQuote.lines[indexLine].field_cant;
    if (fieldCant != "") {
      this.formQuote.lines[indexLine].field_total_cost = parseFloat(result * fieldCant);
      this.containerRow.querySelector('[name*="field_total_cost"]').value = Utilities.formatNumber(this.formQuote.lines[indexLine].field_total_cost);
    }
  }

  landedCostFactor(indexLine) {
    const cost = this.formQuote.lines[indexLine].field_cost;
    const assessment = this.containerRow.querySelector(
      '[name*="field_assessment"]'
    );
    const landed = this.containerRow.querySelector(
      '[name*="field_landed_cost"]'
    );
    let result = 0;

    if (cost > 0) {
      const shipp = this.getShipping(indexLine);
      if (shipp != undefined && shipp.hasOwnProperty('type_delivery')) {
        if (shipp.type_delivery == 'aer') {
          let optionSelect = 0;
          if (assessment && assessment.value != '') {
            optionSelect = assessment.options[assessment.selectedIndex];
            optionSelect = optionSelect.textContent;
          }
          result = this.dataProduct.weight * shipp.cost;
          result = parseFloat(cost) + parseFloat(result);
          result = result * ((1 + parseFloat(optionSelect) / 100) / cost);
          if (landed)
            this.formQuote.lines[indexLine].field_landed_cost = result;
        }
        else {
          if (shipp.type_delivery == 'loc') {
            result = 1 + (parseFloat(shipp.cost) / 100);
            this.formQuote.lines[indexLine].field_landed_cost = result;
          }
          if (shipp.type_delivery == 'mar') {
            result = parseFloat(shipp.cost);
            this.formQuote.lines[indexLine].field_landed_cost = result;
          }
        }
        if (shipp.type_delivery == 'defa')
          this.formQuote.lines[indexLine].field_landed_cost = 1;
      }

    }
    landed.value = Utilities.formatNumber(this.formQuote.lines[indexLine].field_landed_cost);
  }

  getTrm() {
    return this.ui.parameters.find(
      (item) => item.tid == parseInt(this.dataProduct.currency)
    );
  }

  getShipping(indexLine) {
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
      const qty = this.formQuote.lines[indexLine].field_qty;
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
        qty != ""
      ) {
        const totalUsd = this.formQuote.lines[indexLine].field_total_cost;
        const assessment = this.containerRow.querySelector(
          '[name*="field_assessment"]'
        );
        if (totalUsd && objRes != undefined) {

          let optionSelect = 0;
          if (assessment && !assessment.disabled) {
            optionSelect = assessment.options[assessment.selectedIndex];
            optionSelect = optionSelect.textContent;
          }
          const shipping = objRes.cost * qty;
          const shipExw = parseFloat(totalUsd) + parseFloat(shipping);
          const asse = shipExw * (parseFloat(optionSelect) / 100);
          const customsGet = this.customs.find(
            (item) => item.tid == parseInt(containerDelivery.value)
          );
          if (customsGet) {
            const customs = shipExw * (objRes.customs / 100);
            const localDelivery =
              shipping * (parseFloat(customsGet.shipping_method) / 100);
            const landedCost = localDelivery + customs + asse + shipExw;
            res = { 'cost': landedCost / parseFloat(totalUsd), 'type_delivery': 'mar' };
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

  vrUnitUsd(indexLine) {
    const cant = this.formQuote.lines[indexLine].field_cant;
    const factCost = this.formQuote.lines[indexLine].field_landed_cost ?? 0;
    const costUnit = this.formQuote.lines[indexLine].field_cost ?? 1;
    const margin_ = this.containerRow.querySelector('[name*="field_margin"]');
    const vrUnit_ = this.containerRow.querySelector('[name*="field_unit_sale"]');
    const vrTotal_ = this.containerRow.querySelector('[name*="field_total_sale"]');
    const factSale_ = this.containerRow.querySelector('[name*="field_sale_factor"]');
    let optionMargin = 0;
    if (margin_)
      optionMargin = margin_.options[margin_.selectedIndex];
    let vrUnitRes = 0;
    if (factCost > 0 && costUnit > 0)
      vrUnitRes = (parseFloat(factCost) * parseFloat(costUnit)) / (1 - (parseFloat(optionMargin.textContent) / 100));
    this.formQuote.lines[indexLine].field_unit_sale = vrUnitRes;
    this.formQuote.lines[indexLine].field_total_sale = (parseFloat(cant) * vrUnitRes);
    this.formQuote.lines[indexLine].field_sale_factor = (parseFloat(vrUnitRes) / parseFloat(costUnit));
    vrUnit_.value = Utilities.formatNumber(vrUnitRes);
    vrTotal_.value = Utilities.formatNumber((parseFloat(cant) * vrUnitRes));
    factSale_.value = Utilities.formatNumber((parseFloat(vrUnitRes) / parseFloat(costUnit)));
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

  othersValues(indexLine) {
    this.formQuote.lines[indexLine].field_container_type = this.containerRow.querySelector('[name*="field_container_type"]').value;
    this.formQuote.lines[indexLine].field_qty = this.containerRow.querySelector('[name*="field_qty"]').value;
    this.formQuote.lines[indexLine].field_container_delivery = this.containerRow.querySelector('[name*="field_container_delivery"]').value;
    this.formQuote.lines[indexLine].field_delivery_time = this.containerRow.querySelector('[name*="field_delivery_time"]').value;
    this.formQuote.lines[indexLine].field_delivery_time_client = this.containerRow.querySelector('[name*="field_delivery_time_client"]').value;
    this.formQuote.lines[indexLine].field_comments <= this.containerRow.querySelector('[name*="field_comments"]').value;
  }

  process() {
    if (this.containerRow && this.nid && this.containerRow.dataset.num !== undefined) {
      const indexLine = this.containerRow.dataset.num - 1;
      this.costTotal(indexLine);
      this.weightTotal(indexLine);
      this.taxCalculate(indexLine);
      this.vrCosttUsd(indexLine);
      this.landedCostFactor(indexLine);
      this.vrUnitUsd(indexLine);
      this.othersValues(indexLine);
      console.log(this.formQuote.lines[indexLine]);
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
