var path = require('path');

module.exports = {
    entry: './index.js',
    output: {
        filename: 'kerkel.js',
        path: path.resolve(__dirname, 'build')
    }
};
