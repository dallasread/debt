var App = require('./app'),
    app = new App({
        data: JSON.parse(window.localStorage.getItem('calc') || JSON.stringify({
            debts: [
                { name: 'House', rate: 2.89, principle: 209000, payment: 1050 },
                { name: 'Car',   rate: 5.95, principle: 28000,  payment: 505 }
            ],
            extra: 650
        }))
    });

window.app = app;

document.body.appendChild(app.element);
