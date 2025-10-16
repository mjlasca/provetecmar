import { QuoteUi } from "./paragraphs/quote-ui";

export class FormQuote{
    paragraphs = [];
    form = null;
    ui = null;
    settings = [];
    calc = null;
    constructor(form = null, settings = null){
        this.form = form;
        this.settings = settings;
        this.ui = new QuoteUi(settings);
    }
    
    init(){
        if(this.form != null){
            this.ui.succesWarning(this.form);
            this.ui.parametersMarkup(this.totalResults());
        }
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

}