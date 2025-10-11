export class SendController{
    constructor(url){
        this.urlBase = `${window.location.origin}`;
        this.url = url;
    }

    async send(data) {
        try {
            const response = await fetch(this.urlBase + this.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (err) {
            console.error('MailSender:', err);
            throw err;
        }
    }
}