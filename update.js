parseQuerystring = () => {
  let query = {}
  location.search.slice(1).split('&').forEach(pair => {
    pair = pair.split('=')
    query[pair[0]] = decodeURIComponent(pair[1] || '')
  })
  return query
}
s = parseQuerystring()
u = oChange => {
  updateObject(s, oChange)
  updateView()
}
updateObject = (oTarget, oChange) => {
  each(oChange, (x, key) => {
    if (undefined === x) return
    if (isf(x))
      oTarget[key] = x(oTarget[key])
    else if (null === x)
      delete oTarget[key]
    else if (iso(x)) {
      if (!oTarget[key]) oTarget[key] = x
      else updateObject(oTarget[key], x)
    }
    else
      oTarget[key] = x
  })
}
size = updateSize()
onresize = () => {
  let s = size
  size = updateSize()
  if (s !== size) updateView()
}
function updateView() {
  render('app', v.app())
}
function updateSize() {
  if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || innerWidth < 1030)
    return -1
  if (innerWidth > 1280)
    return 0
  return 1
}