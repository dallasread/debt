var moment = require('moment'),
    A = require('./utils/amortization'),
    COMMA_REGEX = /(\d+)(\d{3})/;

function comma(val){
    while (COMMA_REGEX.test(val.toString())){
        val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
    }

    return val;
}

module.exports = {
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

            if (!confirm('Are you sure you want to delete this?')) return;

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
    ensureAnEmpty: function ensureAnEmpty(arr) {
        if (!(arr instanceof Array)) return arr;

        for (var i = arr.length - 1; i >= 0; i--) {
            if (!Object.keys(arr[i]).length) {
                return arr;
            }
        }

        arr.push({});

        return arr;
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
};
