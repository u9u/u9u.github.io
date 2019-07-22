function open(url) {
  let r = url.split('#')[0]
  if (r[0] == '?') r = r.slice(3)
  if (s.r != r) {
    s = {r}
    history.pushState(s, '', r ? '?r=' + url : '/')
    load(r)
  }
}
function load(r) {
  r = r || s.r || '/README.md'
  let f = db.mdFiles.find(o => o.r == r)
  if (!f) loadR(r)
  else {
    let url = f.url
    let text = localStorage[url]
    if (text) init(text, f)
    getText(url, t => {
      if (t == text) return
      init(t, f)
      localStorage[url] = t
    })
  }
}
function loadR(r) {
  renderLoading(r)
  let url = transformURL(r)
  if (url.slice(-10) != '/README.md')
    getText(url, initAndSaveFile(url, r))
  else {
    fetch(url).then(res => {
      if (res.status != 404) res.text().then(initAndSaveFile(url, r))
      else {
        url = url.replace('/README.md', '/readme.md')
        getText(url, initAndSaveFile(url, r))
      }
    })
  }
}
function initAndSaveFile(url, r) {
  return t => {
    db.mdFiles.push({ url, r, nOpen: 1 })
    let f = _.last(db.mdFiles)
    init(t, f)
    localStorage[url] = t
  }
}
function init(text, f) {
  let tokens = marked.lexer(text)
  if (tokens.length < 2) {
    render('app', ['pre', JSON.stringify(text)])
    return setTimeout(() => open(''), 500)
  }
  let title = tokens.find(t => t.type == 'heading').text.split('[!')[0] || url.split('/').pop().split('.')[0]
  document.title = title
  f.title = title
  f.lastOpen = Date.now()
  f.nOpen++
  u({
    ...getHeadingsAndDepth(tokens),
    title,
    content: marked.parser(tokens),
    navIcon: 1
  })
  if (location.hash) {
    let el = $(decodeURIComponent(location.hash))
    if (el) el.scrollIntoView()
    else history.replaceState(null, '', location.href.split('#')[0]);
  }
  history.replaceState({ y: $('#content').scrollTop }, '', location.href)
  fixImgSrc()
}
function fixImgSrc() {
  document.querySelectorAll('img').forEach(el => {
    let src = el.getAttribute('src')
    let str = src.slice(0, 4)
    if (str != 'http' && str != 'chro')
      el.src = s.r + '/raw/master/' + src +'?sanitize=true'
    else if(src.indexOf('/blob/'))
      el.src = src.replace('/blob/', '/raw/')
  })
}
function getHeadingsAndDepth(tokens) {
  let min = 5, nMin = 0
  let headings = tokens.filter(t => t.type == 'heading').map(heading => {
    let { depth, text } = heading
    if (depth < min) {
      min = depth
      nMin = 0
    }
    if (depth === min) {
      nMin++
    }
    heading.html = marked(text)
    heading.id = slug(text.split('](')[0])
    return heading
  })
  console.log(min, nMin, nMin > 1 ? min : min + 1)
  return {
    headings,
    depth: nMin > 1 ? min : min + 1
  }
}
function slug(text) {
  return text.toLowerCase().trim()
    .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '')
    .replace(/\s/g, '-')
}
function renderLoading(...urls) {
  render('app', ['col.w100.ca',
    ['cube', [], [], [], [], [], []],
    ['.bold', 'loading'],
    ...urls.map(url => [{ id: url }, url])
  ])
}

v = {
  app: () => [
    '#content.row w100 h100 cc scroll', { onscroll: e(syncTOCheading) },
    !size ? v.bToc() : size < 0 ? v.sToc() : v.mToc(),
    s.searchPallete ? v.searchPallete() : '',
    size < 0 ? v.nav() : s.navIcon ? v.navIcon : '',
    (size > -1 && s.navList) ? v.navList() : '',
    ['article card mw14 w100 hfit hidden-x' + (size < 0 ? ' pt6' : ' mt5 mb5'), { innerHTML: s.content }]
  ],
  toc: 'col mw10 mh100 scroll p6 nowrap lh5 ',
  bToc: () => [
    v.toc + 'fixed c3', { right: '50%', marginRight: '21em' }, ...v.tocList()
  ],
  mToc: () => [
    'row w10', [v.toc + 'fixed c3', ...v.tocList()]
  ],
  sToc: () => s.toc ?
    ['row popup w100 h100 fixed',
      ['.b2 w50', { opacity: 0.5, onclick: e('toc', 0) }],
      [v.toc + 'b7 w50', ...v.tocList( e('toc', 0) )]
    ] : '',
  tocList: (onclick) => s.headings.map(heading => {
    let bold = heading.depth > s.depth ? 'ml6' : 'bold mt4'
    let hID = heading.id
    let color = s.hID == hID ? ' c0' : ''
    return ['a mr2 f5 ' + bold + color, {
      id: 'toc-' + hID,
      title: heading.text,
      onclick,
      onmouseover: e(setAndScrollToHeading, hID),
      href: '#' + hID,
      innerHTML: heading.html
    }]
  }),
  navIcon: [
    'col fixed f7 ', {
      right: '.5em',
      onmouseover() { u({ navList: 1, navIcon: 0 }) }
    },
    '≡'
  ],
  nav: () => s.nav ?
    ['row w100 fixed h100',
      v.navList(),
      ['.b2.w100', { opacity: 0.5, onclick: e('nav', 0) }],
    ] : '',
  navList: () => [
    'col b7 bold word-keep ' + (size < 0 ? 'cc h100 p5' : 'fixed r1 t1'),
    { onmouseleave() { u({ navList: 0, navIcon: 1 }) } },
    ['a c1', { href: '/' }, 'Guide'],
    [{ cursor: 'pointer', onclick: openSearchPallete }, 'Files'],
    ['a c1', { href: 'https://github.com/u9u/u9u.github.io/' }, 'Github'],
  ],
  searchPallete: () => [
    'col fixed w100 mw13 mh80 p6 card ma',
    { top: size < 0 ? 0 : '10%' },
    v.input('searchInput mb3', {
      placeholder: 'Add or Search markdown file…', fontSize: '1.2em',
      onblur() {
        setTimeout(() => u({ searchPallete: 0 }), 20)
      },
      onkeydown: e({
        ret() { openFile(s.searchSelect) },
        up: { searchSelect: ifDec },
        dn: { searchSelect: ifInc(s.searchResult) }
      })
    }, searchFiles),
    ['col scroll h100 mt4', ...v.searchList()]
  ],
  searchList: () => {
    if (!s.searchResult.length) {
      return [
        ['row', { onclick: openFile }, 'Add: ' + transformURL(s.searchInput)]
      ]
    }
    return s.searchResult
      .sort((a, b) => b.nOpen - a.nOpen)
      .map(v.searchItem)
  },
  searchItem({ url, title }, i) {
    let color = s.searchSelect === i ? 'c9' : ''
    return ['col mt4',
      { lineHeight: 1.2, onclick: e(openFile, i) },
      ['.bold mr3 ' + color, title],
      ['.c3', url]
    ]
  },
  input(str, o, fn) {
    let a = str.split(' ')
    let id = a.shift()
    let props = {
      ...o,
      id,
      value: s[id],
      oninput: e => {
        s[id] = e.target.value
        fn()
      }
    }
    return ['input ' + a.join(' '), props]
  }
}

function ifInc(arr) {
  return val => val + 1 < arr.length ? val + 1 : val
}
function ifDec(val) {
  return val > 0 ? val - 1 : val
}
function searchFiles() {
  u({
    searchResult: d.mdFiles.filter(o => fuzzy_match(s.searchInput, o.title)),
    searchSelect: 0
  })
}
function openFile(i) {
  let r
  if (s.searchResult.length) r = s.searchResult[i].r
  else r = s.searchInput
  u({ searchPallete: 0 })
  open(r)
}
function setAndScrollToHeading(hID) {
  if (hID && hID != s.hID) {
    u({ hID })
    $('#content').scroll(0, byid(hID).offsetTop - 10)
    fixImgSrc()
  }
}
function syncTOCheading(el) {
  history.replaceState({ y: el.scrollTop }, '', location.href)
  if (!s.toc) return
  if (el.scrollHeight == el.scrollTop + el.offsetHeight)
    return u({ hID: _.last(s.headings).id })
  let prevOffset, hID = s.headings[0].id
  each(s.headings, heading => {
    let offset = byid(heading.id).offsetTop - el.scrollTop - el.offsetHeight / 40
    if (prevOffset && offset < 0 && offset > prevOffset) {
      hID = heading.id
    }
    prevOffset = offset
  })
  if (hID) u({ hID })
  byid('toc-' + hID).scrollIntoViewIfNeeded()
}
function openOrScroll(e) {
  e.preventDefault()
  let el = $('#content')
  let h = innerHeight
  if (e.y < h * 0.3)
    el.scrollBy(0, - h + 46)
  else if (e.y < h * 0.6) {
    if (e.x < innerWidth / 2) u({ nav: 1 })
    else u({ toc: 1 })
  }
  else if (el.scrollHeight - 1200 > el.scrollTop)
    el.scrollBy(0, h - 46)
}
function openSearchPallete() {
  u({
    searchPallete: 1,
    searchInput: '',
    searchSelect: 0,
    searchResult: d.mdFiles,
    nav: 0
  })
  $('input').focus()
}
function transformURL(url) {
  if (url.indexOf('github.com/') > -1) {
    url = url.replace(/github.com/, 'raw.githubusercontent.com')
    if (url.indexOf('/blob/') > -1) {
      url = url.replace(/\/blob\//, '/')
    }
    else if (url.split('/').length == 5) {
      url = url.split('#')[0] + '/master/README.md'
    }
    if (url.slice(-1) == '/') url = url.slice(0, -1)
  }
  return url
}

onpopstate = e => {
  if (e.state) {
    s = parseQuerystring()
    load()
    $('#content').scrollTop = e.state.y
  }
}
onkeydown = e({
  esc() { open('') },
  spc: openSearchPallete
})
onclick = e => {
  let el = e.target
  if (el.onclick) return
  if (el.tagName == 'A') {
    if (location.host == el.host) {
      if (el.pathname.length > 1) {
        e.preventDefault()
        open(s.r + '/blob/master' + el.pathname)
      }
      else if (location.search != el.search) {
        e.preventDefault()
        open(el.search + el.hash)
      }
    }
    else if (/\.md\/?$/.test(transformURL(el.href).split('#')[0])) {
      e.preventDefault()
      if (e.metaKey)
        window.open(location.origin + '/?r=' + el.href)
      else
        open(el.href)
    }
  }
  else if (size < 0) openOrScroll(e)
}
if (!db.mdFiles) db.mdFiles = []
load()