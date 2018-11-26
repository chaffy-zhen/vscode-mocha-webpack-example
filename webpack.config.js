const package = require("./package.json");
const path = require("path");

const config = {
    mode: "development",
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: `${package.name}.js`
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src")
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: /node_modules/
            }
        ]
    }
};

if (process.env.NODE_ENV === "umd") {
    config.optimization = { minimize: false };
    config.output.library = package.name;
    config.output.libraryTarget = "umd2";
    config.output.filename = `${package.name}.js`;
}
if (process.env.NODE_ENV === "umd:min") {
    config.mode = "production";
    config.output.library = package.name;
    config.output.libraryTarget = "umd2";
    config.output.filename = `${package.name}.min.js`;
}
if (process.env.NODE_ENV === "es") {
    config.output.library = package.name;
    config.output.libraryTarget = "commonjs2";
    config.output.filename = `${package.name}.es.js`;
}
if (process.env.NODE_ENV === "commonjs") {
    config.output.library = package.name;
    config.output.libraryTarget = "commonjs2";
    config.output.filename = `${package.name}.common.js`;
}
if (process.env.NODE_ENV === "test") {
    /**
     * 目前能在vscode中正常断点调试的设置只有两种：
     * eval sourcemap映射生成代码，在使用async/await会导致行数错位
     * eval-source-map sourcemap映射源代码，并不会出现错位情况。
     */
    config.devtool = "eval-source-map";
    config.output = Object.assign(config.output, {
        devtoolModuleFilenameTemplate: "[absolute-resource-path]",
        devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
    });
}

module.exports = config;