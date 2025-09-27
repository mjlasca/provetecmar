import { QuoteUi } from "./quote-ui";

/**
 * Clas for utilities quote
 */
export class Calculate extends QuoteUi {
    constructor(containerRow, nid){
        super({'quote_settings':[], 'parameters' : []});
        this.containerRow = containerRow;
        this.dataProduct = null;
        this.url = `https://provectecmar.ddev.site/get-product-quote/${nid}`;
        this.nid = nid;
        this.init();
    }

    async init(){
        try {
            const response = await fetch(this.url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            });
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            const data = await response.json();
            this.dataProduct = data.product;
        } catch (error) {
            console.error("Error en fetchData:", error);
        }
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

    async process(nid){
        await this.init();
        this.costTotal();
        this.weightTotal();
        const lintProduct = this.containerRow.querySelector('.show-product');
        if(lintProduct) 
            lintProduct.href = `/node/${nid}/edit`; 
        else {
            this.linkProduct(nid, this.containerRow);
        } 
        const dragCont = this.containerRow.closest('.paragraph-type--items');
        if(this.dataProduct.weight > 0 && this.dataProduct.cost_unit > 0 && this.dataProduct.provider != ''){
            this.validateProduct(dragCont, true);
        }
        else{
            this.validateProduct(dragCont, false);
        }
    }
}