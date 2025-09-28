import { QuoteUi } from "./quote-ui";
import { Services } from "./services";

/**
 * Clas for utilities quote
 */
export class Calculate{
    constructor(containerRow, nid, settings){
        this.containerRow = containerRow;
        this.dataProduct = null;
        this.parametersQuote = null;
        this.nid = nid;
        this.ui = new QuoteUi(settings);
        this.services = new Services(nid);
        this.init();
        this.shipping = settings.shipping;
    }

    async init(){
        this.dataProduct = await this.services.nodeProductService();
        this.parametersQuote = await this.services.parametersService();
    }

    weightTotal(){
        const fieldCant = this.containerRow.querySelector('[name*="field_cant"]');
        const fieldWeight = this.containerRow.querySelector('[name*="field_weight_total"]');
        if(fieldCant && this.dataProduct.weight)
            fieldWeight.value = parseFloat(this.dataProduct.weight) * parseFloat(fieldCant.value);
        else
            fieldWeight.value = 0;
    }

    costTotal(){
        const fieldCant = this.containerRow.querySelector('[name*="field_cant"]');
        const fieldTotal = this.containerRow.querySelector('[name*="field_total"]');
        if(fieldCant && this.dataProduct.cost_unit)
            fieldTotal.value = parseFloat(this.dataProduct.cost_unit) * parseFloat(fieldCant.value);
        else
            fieldTotal.value = 0;
    }

    taxCalculate(){
        const rfq = this.containerRow.querySelector('[name*="field_company"]');
        const region = this.containerRow.querySelector('[name*="field_delivery_region"]');
        this.containerRow.querySelector('[name*="field_tax"]').value = 0;
        if((rfq && region) && (rfq.value > 0 && region.value > 0)){
            if(this.parametersQuote.taxes){
                const tax = this.parametersQuote.taxes.find(item => item.rfq === rfq.value && item.region === region.value);
                if(tax){
                    this.containerRow.querySelector('[name*="field_tax"]').value = tax.tax;
                }
            }
        }
    }

    vrUnitUsd(){
        let result = this.dataProduct.cost_unit ?? 0;
        if(result > 0){
            result = parseFloat(result / this.getTrm().factor);
            const tax = this.containerRow.querySelector('[name*="field_tax"]');
            if(tax && tax.value != '')
                result = result * (1 + (tax.value / 100));
        }
        this.containerRow.querySelector('[name*="field_cost"]').value = result;
        const fieldCant = this.containerRow.querySelector('[name*="field_cant"]');
        if(fieldCant && fieldCant.value != ''){
            this.containerRow.querySelector('[name*="field_total_cost"]').value = parseFloat( result * fieldCant.value);
        }
    }

    landedCostFactor(){
        const cost = this.containerRow.querySelector('[name*="field_cost"]');
        const assessment = this.containerRow.querySelector('[name*="field_assessment"]');
        let result = 0;
        if( cost && assessment && cost.value > 0 && assessment.value > 0 ){
            const shipp = this.getShipping();
            if(shipp){
                const optionSelect = assessment.options[assessment.selectedIndex];
                result =  ( this.dataProduct.weight * shipp.cost );
                console.log(result);
                result = parseFloat(cost.value) + parseFloat(result);
                console.log(result);
                result = result * ( (1 + ( parseFloat(optionSelect.textContent) / 100) ) / cost.value);
                console.log(( (1 + ( parseFloat(optionSelect.textContent) / 100) ) / cost.value));
            }
        }
        const landed = this.containerRow.querySelector('[name*="field_landed_cost"]');
        if(landed){
            landed.value = result;
        }
    }

    getTrm(){
        return this.ui.parameters.find(item => item.tid == parseFloat(this.dataProduct.currency));
    }

    getShipping(){
        const delivery = this.containerRow.querySelector('[name*="field_delivery_region"]');
        const shippingMethod = this.containerRow.querySelector('[name*="field_shipping_method"]');
        if(delivery && shippingMethod && delivery.value > 0 && shippingMethod.value > 0){
            return this.shipping.find(item => item.origin == delivery.value && item.shipping_method == shippingMethod.value);
        }
    }

    async handleGetProduct(){
        this.dataProduct = await this.services.nodeProductService();
        const lintProduct = this.containerRow.querySelector('.show-product');
        if(lintProduct) 
            lintProduct.href = `/node/${this.nid}/edit`; 
        else {
            this.ui.linkProduct(this.nid, this.containerRow);
        } 
        const dragCont = this.containerRow.closest('.paragraph-type--items');
        if(this.dataProduct.weight > 0 && this.dataProduct.cost_unit > 0 && this.dataProduct.provider != ''){
            this.ui.validateProduct(dragCont, true);
        }
        else{
            this.ui.validateProduct(dragCont, false);
        }
    }

    async process(){
        if(this.containerRow && this.nid){
            await this.handleGetProduct();
            this.costTotal();
            this.weightTotal();
            this.taxCalculate();
            this.vrUnitUsd();
            this.landedCostFactor();
        }
    }
}