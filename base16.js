let styles = {};
['color', 'size', 'space'].forEach(
  name => document.head.append(styles[name] = document.createElement("style"))
)
let abbriviateCSS = {
  c: {
    c: 'color',
    b: 'background-color',
    bc: 'border-color'
  },
  space: {
    f: 'font-size',
    bw: 'border-width',
    lh: 'line-height',
    p: 'padding',
    pl: 'padding-left',
    pr: 'padding-right',
    pt: 'padding-top',
    pb: 'padding-bottom',
    m: 'margin',
    ml: 'margin-left',
    mr: 'margin-right',
    mt: 'margin-top',
    mb: 'margin-bottom',
  },
  size: {
    w: 'width',
    h: 'height',
    mw: 'max-width',
    mh: 'max-height',
    t: 'top',
    y: 'bottom',
    l: 'left',
    r: 'right'
  }
}
base16({
  c: `#1d1f21 #282a2e #474b51 #969896 #b4b7b4 #c5c8c6 #e0e0e0 #ffffff
          #cc6666 #de935f #f0c674 #b5bd68 #8abeb7 #81a2be #b294bb #a3685a`,
  space: `0 1px 2px .2em .4em .8em 1em 2em
        4em 6em 8em 10em 12em 15em 18em 21em`,
  size: `0 1em 2em 3em 4em 6em 8em 10em
      12em 15em 18em 21em 24em 30em 40em 50em`
})
function base16(o) {
  Object.keys(o).forEach(name => {
    setBase16Var(name, o[name])
    setBase16Class(name, abbriviateCSS[name])
  })
}
function setBase16Var(prefix, s) {
  s.trim().split(/\s+/).forEach(
    (color, index) => { document.documentElement.style.setProperty('--' + prefix + index, color) }
  )
}
function setBase16Class(prefix, o) {
  let css = ''
  Object.keys(o).forEach(key => {
    let val = o[key]
    for (let index = 0; index < 16; index++) {
      css += `.${key}${index}{ ${val}:var(--${prefix}${index}) }`
    }
    if (prefix == 'size') css += `.${key}100{ ${val}:100%}`
  })
  let style = document.createElement("style")
  style.innerHTML = css
  document.head.append(style)
}