var UglifyJsPlugin = require('uglifyjs-webpack-plugin');
var path = require('path');
module.exports = {
    entry: path.resolve(__dirname, "index.js"),
    output: {
        filename: "encage.js",
        path: path.resolve(__dirname, "dist")
    },
    mode: 'production',
    module: {
        rules: [
            {
                test: /.+\.js$/,
                loader: 'babel-loader'
            }
        ]
    }
}