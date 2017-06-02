var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');



var extractPlugin = new ExtractTextPlugin({
    filename: 'kerkel.css'
});
var extract_plugin_use = extractPlugin.extract({
    use: [
        'css-loader',
        {
            loader: 'sass-loader',
            options: {
                includePaths: [path.resolve(__dirname, 'node_modules/bootstrap/scss')]
            }
        }
    ]
});


module.exports = {
    entry: {
        "kerkel_app.js": './index.jsx',
        ".styles": './styles/index.scss'
    },
    output: {
        filename: '[name]',
        path: path.resolve(__dirname, 'build')
    },

    module: {
        rules: [
            {
                test: /\.scss$/,
                use: extract_plugin_use
            },

            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    },

    resolve: {
        extensions: ['.js', '.jsx']
    },

    plugins: [
        extractPlugin
    ]
};
