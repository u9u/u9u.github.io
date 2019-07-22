let vnodes = {}
let snabbdomPatch = snabbdom.init([snabbdom_style.default, snabbdom_props.default])
render = (id, aView) => {
  if (!vnodes[id])
    vnodes[id] = snabbdomPatch(
      document.body.appendChild(document.createElement('div')), createVnode()
    )
  let newnode = createVnode(...aView)
  snabbdomPatch(vnodes[id], newnode)
  vnodes[id] = newnode
}

function createVnode(sel, props, ...children) {
  if (iso(sel)) {
    children.unshift(props)
    props = sel
    sel = props.sel || 'div'
  }
  if (!iso(props)) {
    children.unshift(props)
    props = {}
  }
  if (typeof sel == 'string') {
    let aClass = sel.split(' ')
    sel = aClass.shift()
    if (sel[0] == '.' || sel[0] == '#') sel = 'div' + sel
    if (aClass.length) sel += '.' + aClass.join('.')
  }
  if (props.className) {
    sel += props.className.split(' ').join('.')
    delete props.className
  }
  children.forEach((child, i) => {
    if (Array.isArray(child)) children[i] = createVnode(...child)
  })
  return snabbdom.h(sel||'div', { props, style: props }, children)
}