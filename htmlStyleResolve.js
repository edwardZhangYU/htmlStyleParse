class htmlStyle {
  /**
   * 可根据用户指定规则来给元素加style
   * {
   * clearStyle: bool 是否先清除所有样式
   * rules: {
   *  img: {
   *    width: '100%'
   *  }
   * },
   * content: '' 待处理字符串
   * 
   * }
   * 
  */
  constructor(options = {
    clearStyle: false,
    rules: {},
    content: ''
  }) {
    this.clearStyle = options.clearStyle
    this.styleConfig =  options.rules
    this.content = options.content
  }
  mergeOptions(ops) { // 只可以重置样式配置不能再改变内容
    this.styleConfig = {
      ...this.styleConfig,
      ...ops.rules
    }
    this.clearStyle = !!ops.clearStyle
    return this
  }
  getReg() {
    return {
      clearReg: new RegExp(`style\\s*?=\\s*?(['"])[\\s\\S]*?\\1`, 'gi'), // clear style
      styleReg: new RegExp(`style\\s*=\\s*(['"])([\\s\\S]*)\\1`, 'gi'),// 匹配有style的部分
      attrReg(attr) { // 匹配某样式属性
        return new RegExp(`\\s*${attr}\\s*:[\\s\\S]*?;`, 'gi')
      },
      eleBeginReg(ele) { // 匹配某元素起始标签
        return new RegExp(`<${ele}[\\s\\S]*?>`, 'gi')
      }
    }
  }
  clearStyleFun() {
    this.content = this.content.replace(this.getReg().clearReg, '')
  }
  getOldCssStr(val) {
    let oldCss = ''
    if(val.indexOf('style') >= 0) {
      // 得到padding:10px;margin:20
      let tmp = this.getReg().styleReg.exec(val)[2]
      if(tmp && tmp[tmp.length-1]!== ';') { // 保证样式字符串以分号结尾
        // padding:10px;margin:20;
        tmp += ';'
      }
      oldCss = tmp
    }
    return oldCss
  }
  getNewCssStr(ele, oldCss) {
    let newCss = ''
    // 构造新的css 属性字符串
    Object.keys(this.styleConfig[ele]).map(attr => {
      if(oldCss.indexOf(attr) >= 0) { // 当前元素内有该属性
        // 清空重复属性
        oldCss = oldCss.replace(this.getReg().attrReg(attr),'')
      }
      newCss += `${attr}: ${this.styleConfig[ele][attr]};`
    })
    // newcss合并元素原来自带的样式
    newCss += oldCss
    return newCss
  }
  resolveReplaceAttr(ele,con) {
    // eg: <div style='padding:10px;margin:20'><div><div style='margin:20;' 获取很多div
    return con.replace(this.getReg().eleBeginReg(ele), (val)=> {
      // 得到类似 padding:10px;margin:20;的串
      let oldCss = this.getOldCssStr(val)
      let newCss = this.getNewCssStr(ele,oldCss)
      return `<${ele} style="${newCss}">`
    })
  }

  resolve() {
    if(this.clearStyle) {
      this.clearStyleFun()
    }
    let resolvedStr = this.content
    Object.keys(this.styleConfig).map(ele => {
      resolvedStr = this.resolveReplaceAttr(ele, resolvedStr)
    })
    this.content =  resolvedStr
    return this
  }
  getContent() {
    return this.content
  }
  
}
export default htmlStyle