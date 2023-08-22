import '@logseq/libs'
import styleCSS from './style.css'
import { settingsConfig } from './settings'
import { openPopup } from './popup'

function injectMathLive() {
  if (window.top === null) return
  const script = parent.document.createElement('script')
  script.setAttribute('src', `${logseq.baseInfo.lsr}dist/parent.js`)
  parent.document.body.appendChild(script)
}

function main() {
  injectMathLive()
  logseq.provideStyle(styleCSS)
  logseq.useSettingsSchema(settingsConfig)
  logseq.Editor.registerSlashCommand('math', async (event) => {
    openPopup(event.uuid)
  })
  if (logseq.settings?.selectEdit) {
    logseq.Editor.onInputSelectionEnd(async (event) => {
      if (event.text.length <= 2) return
      if (!(event.text.startsWith('$') && event.text.endsWith('$'))) return
      const block = await logseq.Editor.getCurrentBlock()
      if (block === null) return
      openPopup(block.uuid)
    })
  }
  if (logseq.settings?.dollarTrigger) {
    parent.addEventListener('keydown', async (event) => {
      if (event.key !== '$') return
      const caret = await logseq.Editor.getEditingCursorPosition()
      if (caret === null) return
      // HACK: use textContent from #mock-text for faster response
      // because block content from getCurrentBlock can be old.
      // i.e. if typed 'hello $$', it might return 'hello'.
      const blockContent =
        parent.document.getElementById('mock-text')?.textContent
      const block = await logseq.Editor.getCurrentBlock()
      if (block === null) return
      if (caret.pos > 1 && blockContent?.charAt(caret.pos - 2) === '$') {
        openPopup(block.uuid)
      }
    })
  }
}

logseq.ready(main).catch(logseq.UI.showMsg)
