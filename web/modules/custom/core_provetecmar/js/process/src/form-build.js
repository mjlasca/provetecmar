export class FormGenerator {
    /**
     * Define la estructura de los campos que se van a generar.
     * Es un atributo de la clase (estático o dentro del constructor si fuera dinámico).
     */
    constructor() {
        this.formFields = [
            { label: 'Cantidad', type: 'input-text', id: 'cantidad' },
            { label: 'Producto', type: 'input-search', id: 'producto' },
            { label: 'Peso total', type: 'input-text', id: 'peso-total' },
            { label: 'Total', type: 'input-text', id: 'total' },
            { label: 'Margen (%)', type: 'select', id: 'margen', options: [] },
            { label: 'Gravament (%)', type: 'select', id: 'gravament', options: [] },
            { label: 'Empresa', type: 'select', id: 'empresa', options: [] },
            { label: 'Región de entrega', type: 'select', id: 'region-entrega', options: [] },
            { label: 'Incoterm', type: 'select', id: 'incoterm', options: [] },
            { label: 'Tiempo de entrega', type: 'input-text', id: 'tiempo-entrega' },
            { label: 'Comentarios', type: 'input-text', id: 'comentarios' },
            { label: 'Tipo envío', type: 'select', id: 'tipo-envio', options: ['Envío Marítimo', 'Envío Aéreo', 'Envío Terrestre'] },
            { label: 'Entrega contenedor', type: 'select', id: 'entrega-contenedor', options: [] },
            { label: 'City', type: 'input-text', id: 'city' },
            { label: 'Tipo n', type: 'input-text', id: 'tipo-n' },
        ];
    }

    // --- Métodos de Ayuda (Helpers) ---

    /**
     * Crea un elemento HTML con atributos y contenido.
     */
    _createElementWithAttrs(tagName, attributes = {}, innerHTML = '') {
        const element = document.createElement(tagName);
        for (const key in attributes) {
            if (attributes.hasOwnProperty(key)) {
                element.setAttribute(key, attributes[key]);
            }
        }
        if (innerHTML) {
            element.innerHTML = innerHTML;
        }
        return element;
    }

    /**
     * Crea una columna individual (Label + Input/Select).
     */
    _createFormColumn(field) {
        const column = this._createElementWithAttrs('div', { class: 'form-column' });

        // 1. Crear la etiqueta (Label)
        const label = this._createElementWithAttrs('label', { for: field.id }, field.label);
        column.appendChild(label);

        // 2. Crear el campo (Input/Select)
        let fieldElement;

        if (field.type === 'select') {
            fieldElement = this._createElementWithAttrs('select', { id: field.id, name: field.id });
            const defaultOption = this._createElementWithAttrs('option', { value: '' }, '- Seleccione -');
            fieldElement.appendChild(defaultOption);

            field.options.forEach(optText => {
                const option = this._createElementWithAttrs('option', { value: optText.toLowerCase().replace(/\s/g, '-') }, optText);
                fieldElement.appendChild(option);
            });

            // Si es 'Tipo envío', aplicamos la clase de resaltado
            if (field.id === 'tipo-envio') {
                fieldElement.classList.add('highlight-envio'); 
            }

        } else if (field.type === 'input-search') {
            // Caso especial para el campo 'Producto' con icono de búsqueda
            const searchContainer = this._createElementWithAttrs('div', { class: 'search-container' });
            fieldElement = this._createElementWithAttrs('input', { type: 'text', id: field.id, name: field.id, placeholder: 'Buscar producto...' });
            
            // Simular el texto de ejemplo y el icono
            fieldElement.setAttribute('value', 'FILTER (516)'); 
            const searchIcon = this._createElementWithAttrs('span', { class: 'search-icon' }, '🔍'); 

            searchContainer.appendChild(fieldElement);
            searchContainer.appendChild(searchIcon);
            column.appendChild(searchContainer);
            return column; // Retorna la columna con el contenedor de búsqueda
            
        } else { // input-text
            fieldElement = this._createElementWithAttrs('input', { type: 'text', id: field.id, name: field.id });
            
            // Valor de ejemplo para 'Cantidad'
            if (field.id === 'cantidad') {
                fieldElement.setAttribute('value', '1.00');
            }
        }
        
        column.appendChild(fieldElement);
        return column;
    }

    // --- Método Principal ---

    /**
     * Crea una línea completa de campos (row) y la añade a un contenedor del DOM.
     * @param {HTMLElement|string} container - El elemento DOM o el selector donde se añadirá la fila.
     * @returns {HTMLElement} El elemento de la fila (row) creado.
     */
    createFormRow(container) {
        console.log(container);
        // 1. Validar el contenedor
        let targetContainer = (typeof container === 'string') 
            ? document.querySelector(container) 
            : container;

        if (!targetContainer || !(targetContainer instanceof HTMLElement)) {
            console.error('El contenedor especificado no es un elemento DOM válido.');
            return null;
        }

        // 2. Crear el elemento de la fila (row)
        const row = this._createElementWithAttrs('div', { class: 'form-row' });
        
        // 3. Iterar sobre los campos y adjuntarlos a la fila
        this.formFields.forEach(field => {
            const column = this._createFormColumn(field);
            row.appendChild(column);
        });

        // 4. Agregar la fila completa al contenedor
        targetContainer.appendChild(row);

        return row;
    }
}

