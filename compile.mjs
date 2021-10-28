import {
  buildConfig,
  CssCompiler,
  HtmlCompiler,
  MallEnvFlag
} from 'rollup-plugin-softmall-wb';
import sass from 'node-sass';

/**
 * source:  全路径，包含文件名称
 * target:  目标路径，自动生成为xxxx.shell.vue
 * mode:    目标编译模式，默认为线上环境（prod+demo），可设置为dev（prod）
 */
const { WB_SOURCE: source, WB_TARGET: target, WB_MODE: mode } = process.env

let flag = [MallEnvFlag.prod, MallEnvFlag.demo]
if (mode === "dev" || mode === "development") {
  flag = [MallEnvFlag.prod]
}

function scssToCss(scssCode) {
  if (scssCode.trim().length === 0)
    return ""
  const ret = sass.renderSync({
    data: scssCode,
  });
  return ret.css.toString()
}

const cssCompiler = new CssCompiler();
const htmlCompiler = new HtmlCompiler();
cssCompiler.registerCompiler("scss", scssToCss);
cssCompiler.registerCompiler("sass", scssToCss);

export default function index() {
  console.log("fuck", source,"fuck", target)
  return buildConfig(source, target, cssCompiler, htmlCompiler, flag);
}