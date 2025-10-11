export class RequestsUi{
    constructor(container, data) {
        this.container = container;
        this.data = data;
        this.selected = [];
        this.render();
    }

    render() {
        this.container.innerHTML = `
        <div class="selected-items"></div>
        <input type="text" class="autocomplete-input" placeholder="Buscar proveedor...">
        <ul class="suggestions"></ul>
        `;
        this.input = this.container.querySelector('.autocomplete-input');
        this.suggestions = this.container.querySelector('.suggestions');
        this.selectedContainer = this.container.querySelector('.selected-items');

        this.input.addEventListener('input', (e) => this.updateSuggestions(e));
    }

    updateSuggestions(e) {
        const value = e.target.value.toLowerCase();
        this.suggestions.innerHTML = '';
        if (!value) return;
        const filtered = this.data.filter(prov => prov.title.toLowerCase().includes(value) && prov.mail != null);
        filtered.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item.title;
            li.onclick = () => this.addItem(item);
            this.suggestions.appendChild(li);
        });
    }

    addItem(item) {
        if (this.selected.includes(item)) return;
        this.selected.push(item);
        this.renderSelected();
        this.input.value = '';
        this.suggestions.innerHTML = '';
    }

    renderSelected() {
        this.selectedContainer.innerHTML = this.selected.map(i =>
        `<span class="tag">${i.title} <button data-item="${i.title}">&times;</button></span>`
        ).join('');

        this.selectedContainer.querySelectorAll('button').forEach(btn => {
        btn.onclick = () => this.removeItem(btn.dataset.item);
        });
    }

    removeItem(item) {
        this.selected = this.selected.filter(i => i.title !== item);
        this.renderSelected();
    }

    getSelected() {
        return this.selected;
    }

    reset(){
        this.selected = [];
        this.selectedContainer.innerHTML = "";
    }

}