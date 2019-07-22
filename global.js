$ = s => document.querySelector(s)
byid = id => document.getElementById(id)
isa = _.isArray
iso = _.isPlainObject
iss = _.isString
isf = _.isFunction
isi = _.isInteger
each = _.each
map = _.map

fuzzy_match = (s, str) => {
  if (!s || !str || s.length > str.length) return
  let i = 0, n = -1, l
  for (; (l = s[i++]);) if (!~(n = str.indexOf(l, n + 1))) return false
  return true
}