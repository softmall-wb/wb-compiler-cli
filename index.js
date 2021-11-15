#!/usr/bin/env node

/**
 * Softmall Compiler CLI
 * Author:    MeetinaXD
 * Last Edit: Octo 27, 2021
 *
 * Usage:
 *    wbc-cli <folder-name>
 *      这将会编译整个目录的文件（仅第一级）
 *
 *    wbc-cli <folder-name>/<filename>
 *      这将编译某个目录下的一个文件（只能是vue文件）
 *      ** 这个命令会使用rootDir **
 *
 *    wbc-cli <filepath>
 *      如果提供的路径是一个目录，效果同上；
 *      如果提供的路径是一个文件，则单独编译该文件
 *
 * Config:
 *    若要为项目对编译器进行特定的设置，请放置配置文件于项目根目录。
 *    配置文件名称：wbc-cli.config.js
 *
 *    具体参数请参考 wbc-cli-default.config.js
 */

// const shelljs = require("shelljs")
import fs from "fs";
import p from "path";
import colors from "colors";
import yargs from "yargs";
import { hideBin } from "yargs/helpers"
import {
  rollup
} from 'rollup';
import compieConfig from './compile.js';
const __dirname = p.resolve();

Date.prototype.format = function (fmt) {
  let ret;
  const opt = {
    "Y+": this.getFullYear().toString(), // 年
    "m+": (this.getMonth() + 1).toString(), // 月
    "d+": this.getDate().toString(), // 日
    "H+": this.getHours().toString(), // 时
    "M+": this.getMinutes().toString(), // 分
    "S+": this.getSeconds().toString() // 秒
  };
  for (let k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt);
    if (ret) {
      fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
    };
  };
  return fmt;
}

const MODE = {
  single: 'single',
  folder: 'folder'
}

const args = yargs(hideBin(process.argv))
.option('p', {
  alias: 'prod',
  demand: false,
  default: true,
  describe: 'Compile in production mode',
  type: 'boolean'
})
.option('d', {
  alias: 'dev',
  demand: false,
  default: false,
  describe: 'Compile in development mode',
  type: 'boolean'
})
.option('w', {
  alias: 'watch',
  demand: false,
  default: false,
  describe: 'Recompile when its source files change',
  type: 'boolean'
})
.parse()

// 默认配置文件，如果项目内存在wbc-cli.config.js就会自动合并。
const config = {
  rootDir: "src/views",
  outDir: (path, name, mode, env) => {
    return `compiled/${env}`
  },
  beforeCompile: null,
  afterCompile(path, name) {
    name = name.replace('.shell.vue', '')
    // 保持文件名和原来一致
    // fs.renameSync(
    //   p.resolve(path, `${name}.shell.vue`),
    //   p.resolve(path, `${name}.vue`)
    // )
    rm(p.resolve(path, `${name}.vue.prod.js`))
    rm(p.resolve(path, `${name}.vue.demo.js`))
  },
  finished: null
}

let mode = ""

/**  1.路径识别  **/

if (args._.length < 1) {
  console.log("No input provided, compile terminated.".red)
  process.exit(-1)
}

// 必须在项目根目录处运行
if (!fs.existsSync(config.rootDir) || !fs.existsSync("package.json") || !fs.existsSync("src")) {
  console.log("Compiler must be run in root folder of the project.".red)
  process.exit(-1)
}

const arg = args._[0]
let path = p.resolve(arg)
let name = p.basename(arg)


if (!fs.existsSync(path)) {
  path = p.resolve(config.rootDir, arg)
}

if (!fs.existsSync(path)) {
  const t = arg.split("/")
  if (t.length !== 2) {
    console.log("File".red, `${arg}`.yellow.bold, "doesn't exist.".red)
    process.exit(-1)
  }

  path = p.resolve(config.rootDir, t[0], `${t[1]}.vue`)
  name = `${t[1].replace(".vue", "")}.vue`
  if (!fs.existsSync(path)) {
    console.log("File".red, `${arg}`.yellow.bold, "doesn't exist.".red)
    console.log("Hint: Pattern '<folder>/<filename>' is required.")
    process.exit(-1)
  }
}

// console.log(`Path: ${path}`, `Name: ${name}`)
let fnPath = path
let fnName = name
if (fs.lstatSync(path).isDirectory()) {
  mode = MODE.folder
} else {
  mode = MODE.single
  fnPath = p.dirname(path)
}

const projectRoot = p.resolve('.')

// 存在rootdir且在rootDir内的文件才走规则。否则是外部文件，直接编译到文件同目录下
if (path.indexOf(projectRoot) === -1) {
  console.log("Only project file can be compiled.".red)
  process.exit(-1)
}

/**  2.开始编译过程  **/
// const targetDir = p.resolve(config.outDir(fnPath, fnName, mode))
if (mode === MODE.single) {
  // 单文件编译
  compile([path])
} else {
  // 文件夹编译
  compile(shelljs.ls(`${fnPath}/*.vue`))
}

if (args.w) {
  console.log("Watching for files change...")
  watch(path)
}

// console.log(`
// path = ${path}
// target = ${targetDir}
// projectRoot = ${projectRoot}
// mode = ${args.d? 'dev': 'prod'}
// `)

// console.log(p.resolve(__dirname, './compile.mjs'))


// if (ret.code !== 0) {
//   console.log(`Some error(s) occurred when compiling ${path}:`.red)
//   console.log(ret.stderr)
//   console.log('failed'.bgRed, ` ${path}`.red)
//   console.log("compile failed".red)
//   isFunction(config.finished) && config.finished(ret.stderr)
//   shelljs.exit(1);
// } else {
//   isFunction(config.afterCompile) && config.afterCompile(targetDir, p.basename(fnName, '.vue'))
//   isFunction(config.finished) && config.finished()
//   console.log('success'.bgGreen, ` ${fnName}`.blue)
// }

/**
 * 监测文件变动并编译
 * @param {string} path 原文件（夹）路径
 */
function watch(path) {
  fs.watch(path, {
    persistent: true,
    interval: 1000
  }).on('change', (fuck, filename) => {
    compile([p.resolve(fnPath, filename)])
  })
}

/**
 * 批量编译文件到指定目录
 * @param {string[]} filelist 需要编译的文件列表
 */
function compile(filelist) {
  if (!Array.isArray(filelist))
    throw new Error("filelist must be an array.")

  // 批量编译
  filelist.forEach(e => {
    const fnPath = p.dirname(e)
    const fnName = p.basename(e)
    const targetName = `${p.basename(e, '.vue')}.shell.vue`

    const errorFn = err => {
      console.log(`Error`.bgRed, e)
      console.log(err)
    }

    const successFn = (_target, env) => {
      isFunction(config.afterCompile) && config.afterCompile(_target, targetName)
      console.log(colors.gray(new Date().format("HH:MM:SS")), 'success'.bgGreen, `${fnName} -> ${targetName}`.blue, `(${env})`.gray)
    }

    // 默认是prod
    if (args.p) {
      const targetDir = p.resolve(config.outDir(fnPath, fnName, mode, 'prod'))
      singleCompile(e, targetDir, 'prod', errorFn, () => successFn(targetDir, 'production'))
    }
    if (args.d) {
      const targetDir = p.resolve(config.outDir(fnPath, fnName, mode, 'dev'))
      singleCompile(e, targetDir, 'dev', errorFn, () => successFn(targetDir, 'development'))
    }

  })

  if (!args.w) {
    isFunction(config.finished) && config.finished()
  }
}

/**
 * 单个文件编译
 * @param {string} source 源文件路径
 * @param {string} target 目标文件路径，包括文件名和后缀
 * @param {string} mode 编译模式，dev或者prod
 * @param {(err: string) => {}} onError 错误回调
 * @param {() => {}} onSuccess 成功回调
 *
 * @returns {number} 编译结果，true为编译成功
 */
async function singleCompile(source, target, mode, onError, onSuccess) {
  // const targetDir = target
  /**
   * args.d? 'dev': 'prod'
   */
  // const ret = shelljs.exec(`
  //   export PATH="$PATH:${p.resolve(__dirname, 'node_modules/rollup/dist/bin')}" &&
  //   export WB_SOURCE=${source} &&
  //   export WB_TARGET=${targetDir} &&
  //   export WB_MODE=${mode} &&
  //   rollup -c ${p.resolve(__dirname, './compile.mjs')} --silent
  // `, {
  //   silent: true
  // })
  let isSuccess = true;
  try {

    const options = compieConfig(source, target, mode);
    console.log(options);

    for(let option of options){
      // option.input.plugins = option.plugins;
      // option.output.plugins = option.plugins;
      const bundle = await rollup({
        input: option.input,
        plugins: option.plugins
      });
      await bundle.write({
        output: option.output,
        plugins: option.plugins
      });
      await bundle.close();
    }

    if (isFunction(onSuccess)) onSuccess();
  } catch (e) {
    if (isFunction(onError)) onError(e);
    isSuccess = false;
  }
  return isSuccess;
}

function rm(path) {
  if (!fs.existsSync(path))
    return;
  fs.rmSync(path)
}

function isFunction(fn) {
  return typeof fn === 'function'
}