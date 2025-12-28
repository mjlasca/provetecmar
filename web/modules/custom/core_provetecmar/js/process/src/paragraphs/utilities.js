/**
 * Clas for utilities quote
 */
export class Utilities {

    static getId(text) {
        const match = text.match(/\((\d+)\)/);
        return match ? parseInt(match[1], 10) : null;
    }
    static formatNumber(number){
        if (number == undefined || number == null || number == "") {
          return 0;
        }
        return parseFloat(number).toLocaleString('es-CO');
    }
}