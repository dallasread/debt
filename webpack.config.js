var MiniCssExtractPlugin = require('mini-css-extract-plugin'),
    isProduction = process.argv.indexOf('-p') !== -1,
    mode = isProduction ? 'production' : 'development',
    prefix = (mode === 'production' ? '.' : '');

var js = {
    mode: mode,
    entry: ['./index.js'],
    output: { filename: prefix + './assets/calc.min.js' },
    module: {
        rules: [
            { test: /\.html$/, loader: 'html-loader?minimize=false' },
            { test: /\.(png|jpg|gif|wav|ogg|mp3)$/, loader: 'url-loader' },
        ],
    },
    node: {
        fs: 'empty'
    }
};

var css = {
    mode: mode,
    entry: ['./index.scss'],
    output: { filename: prefix + './tmp/style.css' },
    module: {
        rules: [
            {
                test: /\.scss|\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: prefix + './assets/calc.min.css',
        })
    ]
};

// module.exports = [data];
module.exports = [js, css];
