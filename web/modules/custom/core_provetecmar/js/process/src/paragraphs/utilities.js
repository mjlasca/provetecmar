/**
 * Clas for utilities quote
 */
export class Utilities {

    static getId(text) {
        const match = text.match(/\((\d+)\)/);
        return match ? parseInt(match[1], 10) : null;
    }
}