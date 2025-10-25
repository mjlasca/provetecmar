/**
 * Clas for get services
 */
export class Services {
  constructor() {
    this.urlBase = `${window.location.origin}`;
  }

  async nodeProductService(keyword) {
    if (keyword) {
      try {
        console.log("testtt");
        const response = await fetch(
          `${this.urlBase}/get-product-quote/${keyword}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        return data.product;
      } catch (error) {
        console.error("Error en fetchData:", error);
      }
    }
  }

  async nodeProductService() {
    if (this.nid) {
      try {
        const response = await fetch(
          `${this.urlBase}/get-product-quote/${this.nid}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        const data = await response.json();
        return data.product;
      } catch (error) {
        console.error("Error en fetchData:", error);
      }
    }
  }
  async parametersService() {
    try {
      const response = await fetch(`${this.urlBase}/get-parameters`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error en fetchData:", error);
      return false;
    }
  }
}
