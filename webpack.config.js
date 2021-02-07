const path = require('path');
const config = require('./config');
const { DefinePlugin } = require('webpack');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: './frontend/index.js',
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.less$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: MiniCSSExtractPlugin.loader,
                        options: {
                            publicPath: (resourcePath, context) => {
                                return path.relative(path.dirname(resourcePath), context) + '/';
                            }
                        }
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'less-loader'
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json'],
        modules: [
            'node_modules',
            path.resolve(__dirname, 'frontend')
        ]
    },
    output: {
        path: path.resolve(__dirname, 'public/lib'),
        filename: '[name].bundle.js'
    },
    plugins: [
        new MiniCSSExtractPlugin({
            filename: '[name].bundle.css'
        }),
        new DefinePlugin({
            'process.config': {
                environment: JSON.stringify(config.environment),
                ports: JSON.stringify(config.ports),
                urls: JSON.stringify(config.urls),
            }
        })
    ]
};
