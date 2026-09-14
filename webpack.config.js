const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
    // `webpack serve` não passa --mode; o `npm run build` passa production.
    const mode = argv.mode || 'development';

    return {
        entry: './src/index.js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'bundle.js',
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            // O preset-react do Babel 8 liga o JSX de desenvolvimento
                            // (jsxDEV) quando o env do Babel é "development", que é o
                            // padrão sem NODE_ENV. O React de produção não tem jsxDEV,
                            // então o env do Babel precisa seguir o modo do webpack.
                            envName: mode,
                        },
                    },
                },
                {
                    test: /\.scss$/,
                    use: ['style-loader', 'css-loader', 'sass-loader'],
                },
                {
                    test: /\.(png|jpe?g|gif|svg)$/i,
                    type: 'asset/resource', // Para Webpack 5
                },
            ],
        },
        resolve: {
            extensions: ['.js', '.jsx'],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './src/index.html',
            }),
        ],
        devServer: {
            static: './dist',
        },
        mode,
    };
};
