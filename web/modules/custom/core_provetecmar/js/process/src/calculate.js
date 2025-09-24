/**
 * Clas for utilities quote
 */
export class Calculate {
    constructor(containerRow, nid){
        this.containerRow = containerRow;
        this.dataProduct = null;
        this.url = `https://provectecmar.ddev.site/get-product-quote/${nid}`;
        this.nid = nid;
        console.log(this.nid);
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
        this.containerRow.querySelector('.show-product').href = `/node/${nid}/edit`;
        const dragCont = this.containerRow.closest('.paragraph-type--items');
        if(dragCont.classList.contains('product-success'))
            dragCont.classList.remove('product-success');
        if(dragCont.classList.contains('product-warning'))
            dragCont.classList.remove('product-warning');
        if(this.dataProduct.weight > 0 && this.dataProduct.cost_unit > 0 && this.dataProduct.provider != '')
            dragCont.classList.add('product-success');
        else{
            dragCont.classList.add('product-warning');
        }
    }
}