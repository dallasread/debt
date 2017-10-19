var data;

try {
    if (window.localStorage) {
        data = JSON.parse(window.localStorage.getItem('calc'));
    }

    if (typeof data === 'undefined') {
        if (window.location.search.indexOf('debt') !== -1) {
            var match = window.location.search.match(/debt=([^&$]+)/);

            if (match) {
                data = JSON.parse(atob(decodeURIComponent(match[1])));
            }
        }
    }
} catch (e) {}

if (typeof data === 'undefined' || typeof data.debts === 'undefined') {
    data = {
        debts: [
            { name: 'Loan',  rate: 5,     principle: 29000, payment: 200 },
            { name: 'Car',   rate: 19.95, principle: 28000, payment: 500 }
        ],
        extra: 250,
        consolidatedRate: 3.25
    };
}

var App = require('./app'),
    app = new App({
        data: data
    });

window.app = app;

document.body.appendChild(app.element);
