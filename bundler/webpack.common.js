const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')

module.exports = {

    entry: {
        script: path.resolve(__dirname, '../src/script.js'),
        // Home: path.resolve(__dirname, '../src/UI/Home.js'),

    },
    output:
    {
        hashFunction: 'xxhash64',
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, '../dist')
    },
    devtool: 'source-map',
    plugins:
        [
            new CopyWebpackPlugin({
                patterns: [
                    { from: path.resolve(__dirname, '../static') }
                ]
            }),
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, '../src/index.html'),
                filename: 'index.html',
                chunks: ['script'],
                minify: true
            }),
            // new HtmlWebpackPlugin({
            //     template: path.resolve(__dirname, '../src/UI/Home.html'),
            //     filename: 'Home.html',
            //     chunks: ['Home'],
            //     minify: true
            // }),
            new MiniCSSExtractPlugin()
        ],
    module:
    {
        rules:
            [
                // HTML
                {
                    test: /\.(html)$/,
                    use:
                        [
                            'html-loader'
                        ]
                },

                // JS
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use:
                        [
                            'babel-loader'
                        ]
                },

                // CSS
                {
                    test: /\.css$/,
                    use:
                        [
                            MiniCSSExtractPlugin.loader,
                            'css-loader'
                        ]
                },

                // Images
                {
                    test: /\.(jpg|png|gif|svg)$/,
                    generator:
                    {
                        filename: 'assets/images/[hash][ext]'
                    }
                },

                // Fonts
                {
                    test: /\.(ttf|eot|woff|woff2)$/,
                    type: 'asset/resource',
                    generator:
                    {
                        filename: 'assets/fonts/[hash][ext]'
                    }
                },
                // GLSL
                {
                    test: /\.glsl$/,
                    use: {
                        loader: 'webpack-glsl-loader',
                        options: {}
                    }
                },

            ]
    }
}