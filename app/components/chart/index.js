var ChartJS = require('chart.js'),
    CustomElement = require('generate-js-custom-element'),
    COMMA = /\B(?=(\d{3})+(?!\d))/g;

var Chart = CustomElement.createElement({
    template: require('./index.html'),
}, function Chart(options) {
    var _ = this;

    CustomElement.call(_, options || {});

    _.set('chart', new ChartJS(_.element.children[0], {
        type: options.type,
        options: {
            animation: false,
            scales: {
                yAxes: [{
                    ticks: {
                        callback: function callback(value, index, values) {
                            return value.toString().replace(COMMA, ',');
                        }
                    }
                }]
            },
            tooltips: {
                callbacks: {
                    label: function(item, data) {
                        return parseInt(item.yLabel).toString().replace(COMMA, ',')
                    }
                }
            }
        }
    }));
});

var UPDATER;
Chart.definePrototype({
    update: function update() {
        var _ = this,
            chart = _.get('chart');

        clearTimeout(UPDATER);

        UPDATER = setTimeout(function() {
            if (chart && _.get('data')) {
                chart.data = _.get('data');
                chart.update();
            }
        }, 30);

        return _.getSuper().update.apply(_, arguments);
    },
});

module.exports = Chart;
