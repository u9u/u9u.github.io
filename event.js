e = (...a) => {
  if (iso(a[0])) return genKeyEvent(a[0])
  else return genMouseEvent(...a)
}
genMouseEvent = (x, ...args) => e => {
  let el = e.target
  el.x = e.x
  e.y = e.y
  el.event = e
  if (isf(x)) x(...args, el)
  else u({ [x]: args[0] })
}
genKeyEvent = keymap => e => {
  e.stopPropagation()
  let el = e.target
  el.event = e
  let abbr = event2abbr(e)
  let x = keymap[abbr]
  if (x) e.preventDefault()
  if (isf(x)) x(e)
  if (iso(x)) u(x)
  if (isa(x)) x[0](...x.slice(1), e)
}

let modAbbr = { acms: 'H', cms: 'A', ams: 'C', acs: 'M', acm: 'S' }
let keyAbbr = {
  8: 'bsp', 9: 'tab', 13: 'ret', 27: 'esc',
  32: 'spc', 33: 'pup', 34: 'pdn', 35: 'end', 36: 'hom',
  37: 'lft', 38: 'up', 39: 'rit', 40: 'dn', 46: 'del'
}
function event2abbr(e) {
  let abbr = ''
  if (e.altKey) abbr += 'a'
  if (e.ctrlKey) abbr += 'c'
  if (e.metaKey) abbr += 'm'
  if (e.shiftKey) abbr += 's'
  return (modAbbr[abbr] || abbr) + (keyAbbr[e.which] || e.key.toLowerCase())
}
