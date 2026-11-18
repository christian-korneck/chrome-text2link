# text2link

Chrome extension that copies a link to the selected text on a page. Opening the link scrolls to and highlights that text.

It uses [fragment links](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Fragment/Text_fragments) (`https://example.com/page#:~:text=...`). If the text appears more than once, the link goes to the first match.

## Install

1. Open `chrome://extensions` and enable **Developer mode**.
2. Click **Load unpacked** and select this folder.

## Use

Select text, then either:

- right-click -> **text2link** -> **copy link to clipboard**, or
- click the text2link toolbar icon (for pages that block the context menu).
