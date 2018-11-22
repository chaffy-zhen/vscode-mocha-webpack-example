# vscode-mocha-webpack-example

> 逐步创建组件的构建环境

webpack作为目前开发主流的构建工具，每次开发新组建都需要耗时整合各类设置，本文将逐步记录整合过程，为新手提供基础思路。

简单说一下我的需要，我在开发`vue-sitemap`时所需要一下几个基本设置：

- 构建生成commonjs, umd, es三种模式的代码提供给使用者
- 开发过程中需在vscode编辑器中能方便断点调试
- 需运行测试和检查测试覆盖的进度

以上三个作为开发一个组件(`package`)是基础中基础的需求，当然还有更多细节内容需要添加，由于篇幅过长另加文章再说吧。（欢迎各位读者评论留下你认为需要的功能( • ̀ω•́ )✧）

## 第一步：构建工具

接下来我们先从最基础的开始，上面也提到webpack作为目前主流构建的工具，那么先以此为基础起步吧！

由于我需要把项目发布至npm的，所以第一步先初次化`package.json`

```sh
npm init
```

> 初次化细节各位读者找其他文章补全吧，这里不细说

接下来看看目录结构

```txt
dist         //生产文件的目录
docs         //文档目录
src          //源代码目录
src/index.js //入口文件
tests        //测试代码目录
package.json
README.md    //GitHub创建仓库时默认创建
```

把基本的依赖安装上后，在`package.json`设置构建命令方便之后使用。

```sh
npm install -D webpack webpack-cli cross-env
```

> 这里使用的webpack4，后续设置也是基于4来设置，`cross-env`是帮助在win下能正常使用环境变量的包，我开发在win环境于是在这加上。

```json
//# package.json
{
  "version": "0.1.0",
  "name": "vue-sitemap",
  "description": "用于管理导航、面包屑及路由等基于vue的功能整合",
  "main": "./src/index.js",
  "scripts": {
    "build": "cross-env NODE_ENV=production webpack --propress --hide-modules",
  }
  ...
}
```

这里我们可以尝试运行一下命令`npm run build`尝试能否构建成功，成功的情况下在`dist`目录下会生成`main.js`的文件。

设置`webpack.config.js`来满足我们的满足第一个需要生成三种模式的代码：

```js
//# webpack.config.js

const package = require('./package.json')
const path = require('path')

const config = {
    entry: "./src/index.js",  //入口文件
    output: {                 //输出设置
        path: path.resolve(__dirname, "./dist"),
        filename: `${package.name}.js`
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src")
        }
    }
}

if (process.env.NODE_ENV === "umd") {
    config.optimization = { minimize: false };
    config.output.library = package.name;
    config.output.libraryTarget = "umd2";
    config.output.filename = `${package.name}.js`;
}
if (process.env.NODE_ENV === "umd:min") {
    config.output.library = package.name;
    config.output.libraryTarget = 'umd2';
    config.output.filename = `${package.name}.min.js`;
}
if (process.env.NODE_ENV === "es") {
    config.output.library = package.name;
    config.output.libraryTarget = "amd";
    config.output.filename = `${package.name}.es.js`;
}
if (process.env.NODE_ENV === "commonjs") {
    config.output.library = package.name;
    config.output.libraryTarget = "commonjs2";
    config.output.filename = `${package.name}.common.js`;
}

module.exports = config
```

加上新的命令

```json
//# package.json
{
  "version": "0.1.0",
  "name": "vue-sitemap",
  "description": "用于管理导航、面包屑及路由等基于vue的功能整合",
  "main": "./src/index.js",
  "scripts": {
    "build": "npm run build:commonjs && npm run build:es && npm run build:umd && npm run build:umd:min",
    "build:umd": "cross-env NODE_ENV=umd webpack --mode=production --progress --hide-modules",
    "build:umd:min": "cross-env NODE_ENV=umd:min webpack --mode=production --progress --hide-modules",
    "build:es": "cross-env NODE_ENV=es webpack --mode=production --progress --hide-modules",
    "build:commonjs": "cross-env NODE_ENV=commonjs webpack --mode=production --progress --hide-modules"
  }
  ...
}
```

运行`npm run build`就会为commonjs, es, umd三种模式生成对应的文件。

大概是这样子：

```txt
./dist/
    vue-sitemap.common.js
    vue-sitemap.es.js
    vue-sitemap.min.js
    vue-sitemap.js
```

## 第二步，设置babel

解决兼容我们需要使用上`babel`，在`webpack`的情景下我们需要`babel-loader`，简单设置便可兼容则需要`babel-preset-env`：

```sh
npm install -D babel babel-cli babel-preset-env
```

接着在`.babelrc`文件里设置babel兼容的规则：

```json
{
    "presets": [
        [
            "env",
            {
                "useBuiltIns": false,
                "modules": false
            }
        ]
    ]
}
```

在`webpack`加上`babel`支持

```js
const package = require('./package.json')
const path = require('path')

const config = {
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
                loader: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    }
}

...

module.exports = config
```

到这步构建的基础设置就完成了。

## 第三步，添加自动化测试

相信对自动化测试有所了解的读者应该对`mocha`并不陌生，不了解的可以先去补补相关知识再往下看。简单的测试较多使用`mocha`来进行处理，还有断言库`chai`和提供promise支持的`chai-as-promised`等等，下面先把这些依赖安装上：

```sh
npm install -D mocha mocha-webpack chai chai-as-promised
```

> 测试代码想使用es新特性时可以使用`mocha-webpack`这个插件。

然后在`package.json`添加上测试命令：

```json
{
    ...
    "scripts": {
        "build": "npm run build:commonjs && npm run build:es && npm run build:umd && npm run build:umd:min",
        "build:umd": "cross-env NODE_ENV=umd webpack --mode=production --progress --hide-modules",
        "build:umd:min": "cross-env NODE_ENV=umd:min webpack --mode=production --progress --hide-modules",
        "build:es": "cross-env NODE_ENV=es webpack --mode=production --progress --hide-modules",
        "test": "cross-env NODE_ENV=test mocha-webpack tests/**/*.spec.js"
    }
    ...
}
```

babel也需要设置一下：

```json
//# .babelrc
{
    ...
    "env": {
        "test": {
            "presets": [
                [
                    "env",
                    {
                        "modules": false,
                        "targets": {
                            "node": "current"
                        }
                    }
                ]
            ]
        }
    }
}
```

为了能测试添加`tests/unit/example.spec.js`和`src/index.js`两个文件，代码如下：

```js
//# src/index.js
export function getRole(user){
    switch(user){
        case "Packy":
            return "admin"
        case "Joan":
            return "reader"
    }
}

//# tests/unit/example.spec.js
import { assert } from "chai";
import { getRole } from "@/index";

describe('Testing', ()=>{
  it('Packy is admin', ()=>{
    assert.equal(getRole('Packy'), 'admin');
  })
  it("Joan is reader", () => {
    assert.equal(getRole("Joan"), "reader");
  });
})
```

现在运行测试命令就能得出测试结果了：

```sh
npm run test
```

大概输出是这个样子：

```txt
WEBPACK  Compiling...

  [======================== ] 95% (emitting)
 WEBPACK  Compiled successfully in 845ms

 MOCHA  Testing...



  Testing
    √ export default is Array


  1 passing (5ms)

 MOCHA  Tests completed successfully
```

### 关于测试覆盖率的问题

有了测试还得知道测试是否都覆盖了所有代码（听说基本要到80%，有些团队可能要求更高90~95%），那如何得知？

`nyc`这个包就能帮助到我去检验测试覆盖率，首先先安装依赖：

```sh
npm install -D nyc babel-plugin-istanbul
```

再设置检查范围和添加命令：

```json
//# package.json
{
    ...
    "scripts": {
        "build": "npm run build:commonjs && npm run build:es && npm run build:umd && npm run build:umd:min",
        "build:umd": "cross-env NODE_ENV=umd webpack --mode=production --progress --hide-modules",
        "build:umd:min": "cross-env NODE_ENV=umd:min webpack --mode=production --progress --hide-modules",
        "build:es": "cross-env NODE_ENV=es webpack --mode=production --progress --hide-modules",
        "build:commonjs": "cross-env NODE_ENV=commonjs webpack --mode=production --progress --hide-modules",
        "test": "cross-env NODE_ENV=test nyc mocha-webpack tests/**/*.spec.js"
    },
    ...
    "nyc": {
        "include": [
            "src/**"
        ],
        "instrument": false,
        "sourceMap": false
    }
    ...
}
```

安装依赖中也看到`babel`也需要添加相关的设置：

```json
//# .babelrc
{
    ...
    "env": {
        "test": {
            "presets": [
                [
                    "env",
                    {
                        "modules": false,
                        "targets": {
                            "node": "current"
                        }
                    }
                ]
            ],
            "plugins": [
                "istanbul"
            ]
        }
    }
}
```

运行`npm run test`将会得到以下内容：

```txt
 WEBPACK  Compiling...

  [======================   ] 89% (record hash)
 WEBPACK  Compiled successfully in 836ms

 MOCHA  Testing...



  Testing
    √ export default is Array


  1 passing (5ms)

 MOCHA  Tests completed successfully

----------|----------|----------|----------|----------|-------------------|
File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
----------|----------|----------|----------|----------|-------------------|
All files |      100 |      100 |      100 |      100 |                   |
 index.js |      100 |      100 |      100 |      100 |                   |
----------|----------|----------|----------|----------|-------------------|
```

简单说一下这四栏东西代表什么意思：

- Stmts: `Statement coverage` 声明覆盖率，程序中的每个语句都已执行吗？
- Branch: `Branch coverage` 分支覆盖率，是否已执行每个控制结构的每个分支（也称为DD路径）（例如if和case语句）？例如，给定if语句，是否已执行true和false分支？
- Funcs: `Function coverage` 方法覆盖率，是否已调用程序中的每个函数（或子例程）？
- Lines: `Line coverage` 行代码覆盖，是否已执行源文件中的每个可执行的行？

不在覆盖范围内的代码的行数会在`Uncovered Line`这栏显示。

### 让测试跟进一步，在vscode中调试

在vscode中调试需要些额外设置，添加以下代码至`webpack.config.js`。

```js
//# webpack.config.js

...

if (process.env.NODE_ENV === "test") {
    config.devtool = "eval-source-map";
    config.output = Object.assign(config.output, {
        devtoolModuleFilenameTemplate: "[absolute-resource-path]",
    });
}

module.exports = config;
```

> 设置参考：[vscode-ts-webpack-node-debug-example](https://github.com/kube/vscode-ts-webpack-node-debug-example)

> 值得一提的是，原文说`source-map`使用`eval`相关的设置并不能断点，使用`mocha-webpack`不知道为何必须使用`eval`，正常的`source-map`设置却不生效。如果阅读这篇文章的你知道原因的话请在评论通知一下作者我XD

然后就可以打开vscode的调试，把下面代码添加到配置：

```json
{
    // 使用 IntelliSense 了解相关属性。 
    // 悬停以查看现有属性的描述。
    // 欲了解更多信息，请访问: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
    {
        "type": "node",
        "request": "launch",
        "name": "Mocha-webpack Tests",
        "program": "${workspaceFolder}/node_modules/mocha-webpack/bin/mocha-webpack",
        "args": [
            "--full-trace",
            "--timeout",
            "999999",
            "--colors",
            "tests/**/*.js"
        ],
        "sourceMaps": true,
        "env": {
            "NODE_ENV": "test"
        },
        "internalConsoleOptions": "openOnSessionStart"
    }]
}
```

现在就可以愉快的使用vscode进行调试了。

**我的动力来自你的指头，请用你的指头使劲给我个赞吧！d(´ω｀ )**

**觉得本文有帮助的话不要忘记点一下收藏φ(>ω<*) 哦！**

**同时欢迎各路新手、大神在本文下方吐槽留言，谢谢各位参与！( • ̀ω•́ )✧**

下面是本文完整例子，记得star一下！

- [vscode-babel-debug-example](https://github.com/lpreterite/vscode-babel-debug-example)