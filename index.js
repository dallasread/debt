var App = require('./app'),
    app = new App({
        data: window.localStorage && window.localStorage.getItem('calc') ? JSON.parse(window.localStorage.getItem('calc')) : {
            debts: [
                { name: 'Loan',  rate: 5,     principle: 29000, payment: 200 },
                { name: 'Car',   rate: 19.95, principle: 28000, payment: 500 }
            ],
            extra: 250
        }
    });

window.app = app;

document.body.appendChild(app.element);
