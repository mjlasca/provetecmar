import { Calculate } from "./paragraphs/calculate";
import { QuoteUi } from "./paragraphs/quote-ui";

export class FormQuote{
    lines = [];
    form = null;
    ui = null;
    settings = [];
    calc = null;
    constructor(form = null, settings = null){
        this.form = form;
        this.settings = settings;
        this.ui = new QuoteUi(settings, this);
        this.calc = new Calculate(null, null, settings, this);
        this.initLines();
        this.init();
    }

    init(){
        this.form = document.querySelector('form');
        this.form.addEventListener('submit', (e) => this.formSubmit(e));
    }

    totalResults(){
        const data = {
            'totals': {
                'cost': 0,
                'total' : 0,
                'weight' : 0
            },
            'terms' : []
        };
        const weights = document.querySelectorAll('[name*="field_weight_total"]');
        const totalCost = document.querySelectorAll('[name*="field_total_cost"]');
        const totalSale = document.querySelectorAll('[name*="field_total_sale"]');
        data.totals.weight = this.getTotalField(weights).toFixed(2);
        data.totals.cost = this.getTotalField(totalCost).toFixed(2);
        data.totals.total = this.getTotalField(totalSale).toFixed(2);
        return data;
    }

    getTotalField(container){
        let rest = 0;
        if(container.length > 0){
            container.forEach(el => {
                if(el.value && el.value > 0){
                rest = rest + parseFloat(el.value);
                }
            });
        }
        return rest;
    }

    getObjLine(nid){
        return this.lines.find(item => item.nid == nid);
    }

    incoterms(tr){
        const saleInco = document.querySelector('[name*="field_incoterms"]');
        const purchInco = tr.querySelector('[name*="field_incoterm"]');
        this.ui.incotermsMatriz(tr,this.getTextSelect(saleInco)+this.getTextSelect(purchInco));
    }

    getTextSelect(selectEle){
        const index = selectEle.selectedIndex;
        const optionSelected = selectEle.options[index];
        return optionSelected.textContent;
    }

    calculate(input){
        let obj = {};
        const tr = input.closest('tr');
        this.incoterms(tr);
        const prop = input.name.replace('[]','');
        obj[prop] = input.value;
        obj['nid'] = tr.dataset.id;
        this.setLine(obj);
        this.calc.containerRow = tr;
        this.calc.nid = tr.dataset.id;
        this.calc.dataProduct = this.getObjLine(this.calc.nid);
        this.calc.dataProduct.currency = tr.querySelector('[name*="field_currency_line"]').value;
        this.calc.process();
        obj = this.instanceField(tr);
        obj['nid'] = tr.dataset.id;
        this.setLine(obj);
    }

    instanceField(tr){
        const fields = tr.querySelectorAll('input[name*="field_"] , select[name*="field_"]');
        let props = {};
        fields.forEach(el => {
            props[el.name.replace('[]','')] = el.value;
        });
        
        return props;
    }

    initLines(){
        if(this.settings.items.length > 0){
            this.lines = this.settings.items;
            Object.values(this.lines).forEach(item => {
                this.ui.setLine(item);
            });
        }
    }

    setLine(data, oldnid = null) {
        if (this.lines.length > 0) {
            if(data.nid == null)
                return;
            if( oldnid != null && data.nid != oldnid )
                this.lines = this.lines.filter(line => line.nid !== oldnid);
            const search = this.lines.find(line => line.nid === data.nid);
            if (search) {
                Object.assign(search, data);
                return { 'msg': 'Línea de producto actualizada', 'success': true };
            }
        }
        this.lines.push(data);
        return { 'msg': 'Nueva línea de producto agregada', 'success': true };
    }

    async formSubmit(e) {
        e.preventDefault();
        const clickedButton = e.submitter;
        const form = e.target;

        if (!clickedButton) {
            console.error('No se detectó el botón de acción. Fallo al intentar guardar.');
            return;
        }
        try {
            await this.sendLines();
            const tempInput = document.createElement('input');
            tempInput.type = 'hidden';
            tempInput.name = clickedButton.name;
            tempInput.value = clickedButton.value;
            if (clickedButton.id) {
                tempInput.id = clickedButton.id;
            }
            form.appendChild(tempInput);
            form.submit();
        } catch (error) {
            console.error("Fallo al guardar las líneas con Fetch. El guardado del nodo ha sido cancelado.", error);
        }
    }

    async sendLines(){
        try {
            const response = await fetch(
                `/save-lines/${this.settings.nid}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(this.lines),
                }
            );
            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({ message: 'Error desconocido del servidor.' }));
                throw new Error(
                    `Error HTTP ${response.status}: ${errorBody.message || 'Fallo al guardar las líneas.'}`
                );
            }
            const data = await response.json();
            console.log("Líneas guardadas exitosamente. IDs recibidos:", data);
            return data;

        } catch (error) {
            console.error("Error al guardar las líneas de cotización:", error);
            throw error;
        }
    }


}