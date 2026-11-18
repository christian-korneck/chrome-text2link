chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: 'text2link', title: 'text2link', contexts: ['selection'] });
  chrome.contextMenus.create({ id: 'copy', parentId: 'text2link', title: 'copy link to clipboard', contexts: ['selection'] });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'copy') run(tab.id, info.frameId ?? 0);
});

chrome.action.onClicked.addListener((tab) => run(tab.id, 0));

async function run(tabId, frameId) {
  let ok = false;
  try {
    const [res] = await chrome.scripting.executeScript({ target: { tabId, frameIds: [frameId] }, func: copyLink });
    ok = res?.result === true;
  } catch (e) {} // restricted pages (chrome://, Web Store, ...)
  await chrome.action.setBadgeBackgroundColor({ tabId, color: ok ? '#188038' : '#d93025' });
  await chrome.action.setBadgeText({ tabId, text: ok ? '✓' : '✗' });
  setTimeout(() => chrome.action.setBadgeText({ tabId, text: '' }).catch(() => {}), 1500);
}

// Runs in the page. Must be self-contained.
async function copyLink() {
  const text = String(getSelection() || '').replace(/\s+/g, ' ').trim();
  if (!text) return false;

  // Text directive syntax reserves '&', ',' and '-'; encodeURIComponent leaves '-' alone.
  const enc = (s) => encodeURIComponent(s).replace(/-/g, '%2D');
  const words = text.split(' ');
  const directive = words.length > 10 || text.length > 300
    ? enc(words.slice(0, 5).join(' ')) + ',' + enc(words.slice(-5).join(' '))
    : enc(text);

  const url = new URL(location.href);
  const hash = url.hash.split(':~:')[0]; // keep app anchors/routes, drop old directives
  url.hash = '';
  const link = url.href + (hash || '#') + ':~:text=' + directive;

  try {
    await navigator.clipboard.writeText(link); // does not fire page "copy" handlers
    return true;
  } catch (e) {
    // Fallback (e.g. page not focused or clipboard blocked by Permissions-Policy)
    const sel = getSelection(), ranges = [];
    for (let i = 0; i < sel.rangeCount; i++) ranges.push(sel.getRangeAt(i));
    const ta = document.createElement('textarea');
    ta.value = link;
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    (document.body || document.documentElement).appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    sel.removeAllRanges();
    ranges.forEach((r) => sel.addRange(r));
    return ok;
  }
}
