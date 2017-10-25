var CustomElement = require('generate-js-custom-element'),
    moment = require('moment'),
    A = require('./utils/amortization'),
    parameterize = require('./utils/parameterize'),
    $ = require('jquery'),
    COMMA_REGEX = /(\d+)(\d{3})/;

function comma(val){
    while (COMMA_REGEX.test(val.toString())){
        val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
    }

    return val;
}

var App = CustomElement.createElement({
    template: require('./index.html'),
    components: {
        chart: require('./components/chart')
    },
    partials: {
        input: require('./partials/input.html'),
        diff: require('./partials/diff.html')
    },
    transforms: {
        any: function any(obj) {
            return typeof obj === 'object' && Object.keys(obj).length;
        },
        empty: function empty(obj) {
            return typeof obj !== 'object' || !Object.keys(obj).length;
        },
        add: function add(app, collection) {
            return function(e) {
                e.preventDefault();
                collection.push({});
                app.save();
            };
        },
        remove: function remove(app, debts, debt) {
            return function(e) {
                 e.preventDefault();
                debts.splice(debts.indexOf(debt), 1);
                app.set('debts', []);
                app.set('debts', debts);
                app.save();
            };
        },
        comma: comma,
        minimumPayment: function minPayment(debt) {
            return Math.ceil(A.minimumPayment(debt.rate, 30 * 12, debt.principal));
        },
        bind: function bind(app, binder, field, format) {
            return function() {
                var val = this.value;

                if (format === 'integer') {
                    val = parseInt(val);
                } else if (format === 'boolean') {
                    val = this.checked;
                } else if (format === 'float') {
                    val = parseFloat(val);
                }

                binder[field] = val;
                app.save();
            };
        },
        currency: function currency(amount) {
            return '$' + comma(parseInt(amount));
        },
        snowball: A.snowball,
        avalanche: A.avalanche,
        consolidated: A.consolidated,
        timeframe: function timeframe(months) {
            if (months < 12) {
                return months + ' months';
            } else {
                return Math.ceil(months / 12.0) + ' years';
            }
        },
        chart: function chart(debts, extra, showConsolidated, consolidatedRate) {
            var snowball = A.snowball(debts, extra),
                avalanche = A.avalanche(debts, extra),
                consolidated = A.consolidated(debts, extra, consolidatedRate),
                monthLength = Math.max(snowball.history.length, avalanche.history.length, consolidated.history.length),
                datasets = [{
                    label: 'Snowball',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    data: snowball.history
                }, {
                    label: 'Avalanche',
                    backgroundColor: 'rgba(255, 206, 86, 0.2)',
                    borderColor: 'rgba(255, 206, 86, 1)',
                    data: avalanche.history
                }],
                labels = [],
                i;

            for (i = 0; i < monthLength; i++) {
                labels.push(moment().add(i, 'month').format('MMM YYYY'));
            }

            if (showConsolidated) {
                datasets.push({
                    label: 'Consolidated',
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    data: consolidated.history
                });
            }

            return {
                labels: labels,
                datasets: datasets
            };
        },
    }
}, function App(options) {
    var _ = this;

    options                  = options || {};
    options.data             = _.loadData(options.data);
    options.data.app         = _;
    options.data.buttonClass = options.buttonClass;

    CustomElement.call(_, options || {});

    var $el = $(_.element);

    _.element.classList += 'debt';

    $el.on('click', '.toggle-sidebar', function() {
        return false;
    });
});

App.definePrototype({
    save: function save() {
        var _ = this,
            url = window.location.href.split('?')[0] + '?debt=' + encodeURIComponent(btoa(JSON.stringify(_._data)));

        if (window.history) {
            window.history.replaceState({}, url, url);
        }

        if (window.localStorage) {
            window.localStorage.setItem('debt', JSON.stringify(_._data));
        }

        _.update();
    },
    importData: function importData(data) {
        var _ = this;

        for (var key in data) {
            _._data[key] = data[key];
        }

        _.save();
    },
    loadData: function loadData(data) {
        if (data) return data;

        try {
            if (window.localStorage) {
                data = JSON.parse(window.localStorage.getItem('debt'));
            }

            if (!data) {
                if (window.location.search.indexOf('debt') !== -1) {
                    var match = window.location.search.match(/debt=([^&$]+)/);

                    if (match) {
                        data = JSON.parse(atob(decodeURIComponent(match[1])));
                    }
                }
            }
        } catch (e) {}

        if (!data || !data.debts) {
            data = {
                debts: [
                    { name: 'Loan',  rate: 5,     principal: 29000, payment: 200 },
                    { name: 'Car',   rate: 19.95, principal: 28000, payment: 500 }
                ],
                extra: 250,
                consolidatedRate: 3.25
            };
        }

        return data;
    },
});

module.exports = App;
