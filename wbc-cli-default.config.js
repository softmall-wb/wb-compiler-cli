const p = require("path")
const fs = require("fs")

export default {
  // 编译器在编译时的根目录，绝对路径不受影响
  rootDir: "src/views",

  /**
   * 编译器输出的路径
   * @param {string} path 编译文件的目录
   * @param {string} name 编译的文件名
   * @param {string} mode 编译模式。folder是整文件夹编译，single是单文件编译
   * @param {string} env 编译环境，dev/pord
   * @returns 应该输出的路径
   */
  outDir: (path, name, mode, env) => {
    return `compiled/${env}`
  },

  /**
   * 编译之前做的事情（每个文件编译前）
   * @param {string} path 等待编译的文件路径
   * @param {string} name 等待编译的文件名
   */
  beforeCompile(path, name) {

  },

  /**
   * 编译之后做的事情（每个文件编译后）
   * @param {string} path 编译后的文件路径
   * @param {string} name 编译后的文件名
   */
   afterCompile(path, name) {
    name = name.replace('.shell.vue', '')
    // 保持文件名和原来一致
    // fs.renameSync(
    //   p.resolve(path, `${name}.shell.vue`),
    //   p.resolve(path, `${name}.vue`)
    // )
    fs.rmSync(p.resolve(path, `${name}.vue.prod.js`))
    fs.rmSync(p.resolve(path, `${name}.vue.demo.js`))
  },

  /**
   * 整个编译过程结束后做的事情
   */
  finished() {

  }
}