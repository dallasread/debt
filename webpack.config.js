var path = require('path'),
    webpack = require('webpack'),
    isProduction = process.argv.indexOf('-p') !== -1,
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    WriteJsonPlugin = require('write-json-webpack-plugin'),
    extractSass = new ExtractTextPlugin({
        filename: './assets/calc.min.css'
    });

var js = {
    entry: ['./index.js'],
    output: { filename: './assets/calc.min.js' },
    module: {
        loaders: [
            { test: /\.json$/, loader: 'json-loader' },
            { test: /\.html$/, loader: 'html-loader?minimize=false' },
            { test: /\.png$/,  loader: 'url-loader?mimetype=image/png' },
            { test: /\.jpeg|\.jpg$/, loader: 'url-loader?mimetype=image/jpeg' },
        ],
    },
    node: {
        fs: 'empty'
    }
};

var css = {
    entry: ['./index.scss'],
    output: { filename: '../tmp/style.css' },
    module: {
        rules: [{
            test: /\.scss|\.css$/,
            use: extractSass.extract({
                use: [{
                    loader: 'css-loader'
                }, {
                    loader: 'sass-loader'
                }],
                fallback: 'style-loader'
            })
        }]
    },
    plugins: [
        extractSass
    ]
};

// module.exports = [data];
module.exports = [js, css];
