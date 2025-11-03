import autoComplete from "@tarekraafat/autocomplete.js";

export class AutoCompleteProduct{

  static getproduct(input) {
    new autoComplete({
      selector: () => input,
      debounce: 300,
      data: {
        src: async (query) => {
          if (query.length < 2) return [];
          const res = await fetch(`/api/products/autocomplete?q=${encodeURIComponent(query)}`);
          return res.json();
        },
        key: ["name"],
      },
      resultsList: {
        maxResults: 10,
        position: "afterend",
      },
      resultItem: {
        highlight: true,
        element: (item, data) => {
          item.innerHTML = `<span>${data.match}</span>`;
        }
      },
      onSelection: (feedback) => {
        const selected = feedback.selection.value;
        input.value = selected.name;
        input.dataset.productId = selected.id;
        console.log(`Seleccionado: ${selected.name} (${selected.id})`);
      }
    });
  }

}
