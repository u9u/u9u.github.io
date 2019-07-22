caches.open('v1').then(cache => cache.add('/'))

self.addEventListener('fetch', e => {
  let url = e.request.url
  console.log('req',url)
  e.respondWith(
    caches.match(e.request).then(req => req || fetch(e.request))
  )
})

function cacheThenUpdate(url) {
  let cache = localStorage[url]
  let network = fetchThenCache(url)
  return cache ? new Response(cache) : network
}
function fetchThenCache(url) {
  return fetch(url).then(r => {
    localStorage[url] = r.text()
    return r
  })
}