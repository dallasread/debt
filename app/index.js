var CustomElement = require('generate-js-custom-element'),
    $ = require('jquery'),
    saveTimer;

var App = CustomElement.createElement({
    template: require('./words.html'),
    components: {
        chart: require('./components/chart')
    },
    partials: {
        input: require('./partials/input.html'),
        graph: require('./partials/graph.html'),
        diff: require('./partials/diff.html')
    },
    transforms: require('./transforms')
}, function App(options) {
    var _ = this;

    options                  = options || {};
    options.data             = _.loadData(options.data);
    options.data.app         = _;
    options.data.buttonClass = options.buttonClass;
    options.data.showConsolidated = false;

    CustomElement.call(_, options || {});

    var $el = $(_.element);

    _.element.classList += 'debt';

    $el.on('click', '.toggle-sidebar', function() {
        return false;
    });
});

App.definePrototype({
    update: function update() {
        var _ = this;
        _.getSuper().update.apply(_, arguments);
    },

    save: function save() {
        var _ = this;

        clearTimeout(saveTimer);

        saveTimer = setTimeout(function() {
            var url = window.location.href.split('?')[0] + '?debt=' + encodeURIComponent(btoa(JSON.stringify(_._data)));

            if (window.history) {
                window.history.replaceState({}, url, url);
            }

            if (window.localStorage) {
                window.localStorage.setItem('debt', JSON.stringify(_._data));
            }
        }, 500);

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
                extra: 500,
                consolidatedRate: 3.25
            };
        }

        return data;
    },
});

module.exports = App;
