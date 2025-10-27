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
        console.log(this.settings);
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

    calculate(e){
        const obj = {};
        const prop = e.target.name.replace('[]','');
        obj[prop] = e.target.value;
        obj['nid'] = e.target.closest('tr').dataset.id;
        this.setLine(obj);
        this.calc.containerRow = e.target.closest('tr');
        this.calc.nid = e.target.closest('tr').dataset.id;
        this.calc.dataProduct = this.getObjLine(this.calc.nid);
        this.calc.process();
    }

    initLines(){
        if(this.settings.items.length > 0){
            this.lines = this.settings.items;
            Object.values(this.lines).forEach(item => {
                this.ui.setLine(item);
            });
        }
    }

    setLine(data) {
        if (this.lines.length > 0) {
            const search = this.lines.find(line => line.nid === data.nid);
            if (search) {
                Object.assign(search, data);
                return { 'msg': 'Línea de producto actualizada', 'success': true };
            }
        }
        this.lines.push(data);
        return { 'msg': 'Nueva línea de producto agregada', 'success': true };
    }

    formSubmit(e){
        e.preventDefault();
        this.sendLines();
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
            console.log("Líneas guardadas exitosamente. IDs recibidos:", data.paragraph_ids);
            return data;

        } catch (error) {
            console.error("Error al guardar las líneas de cotización:", error);
            throw error;
        }
    }


}