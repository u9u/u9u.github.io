let localStorageParsed = {}
d = new Proxy(localStorageParsed, {
  get(target, key) {
    return target[key] || (target[key] = JSON.parse(localStorage[key]))
  }
})
let nestProxy = {
  get: getValueOrProxy,
  set: setTargetValue
}
db = new Proxy(localStorageParsed, {
  get: getLocalStorageValue,
  set: setLocalStorageValue
})
function getValueOrProxy(target, key) {
  let val = target[key]
  if (key != 'prototype' && val instanceof Object) {
    val.__proto__._key = target._key
    return new Proxy(val, nestProxy)
  }
  return val
}
function setTargetValue(target, key, value) {
  target[key] = value
  localStorage[target._key] = JSON.stringify(localStorageParsed[target._key])
  return value
}
function getLocalStorageValue(localStorageParsed, key) {
  let value = localStorageParsed[key]
  if (value) return new Proxy(value, nestProxy)
  value = localStorage[key]
  if (!value) return
  else value = JSON.parse(value)
  value.__proto__._key = key
  localStorageParsed[key] = value
  return new Proxy(value, nestProxy)
}
function setLocalStorageValue(target, key, value) {
  value.__proto__._key = key
  target[key] = value
  localStorage[key] = JSON.stringify(value)
  return value
}