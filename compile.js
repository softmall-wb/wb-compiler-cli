import {
  buildConfig,
  CssCompiler,
  HtmlCompiler,
  MallEnvFlag
} from 'rollup-plugin-softmall-wb';
import sass from 'sass';

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

function buildFlag(mode){
  let flag = [MallEnvFlag.prod, MallEnvFlag.demo];
  if (mode === "dev" || mode === "development") {
    flag = [MallEnvFlag.prod];
  }
  return flag;
}

export default function index(source, target, mode) {

  /**
   * source:  全路径，包含文件名称
   * target:  目标路径，自动生成为xxxx.shell.vue
   * mode:    目标编译模式，默认为线上环境（prod+demo），可设置为dev（prod）
   */
  // const {
  //   WB_SOURCE: source,
  //   WB_TARGET: target,
  //   WB_MODE: mode
  // } = process.env

  const flag = buildFlag(mode);

  // console.log("fuck", source, "fuck", target);
  return buildConfig(source, target, cssCompiler, htmlCompiler, flag);
}