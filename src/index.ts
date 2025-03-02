import '@logseq/libs'
import styleCSS from './style.css'
import { settingsConfig } from './settings'
import { PopupManager } from './popup'

function injectMathLive() {
  const script = parent.document.createElement('script')
  script.setAttribute('src', `${logseq.baseInfo.lsr}dist/parent.js`)
  parent.document.body.appendChild(script)
  return () => parent.document.body.removeChild(script)
}

function main() {
  const removeMathlive = injectMathLive()
  logseq.provideStyle(styleCSS)
  logseq.useSettingsSchema(settingsConfig)
  logseq.Editor.registerSlashCommand('math', async (event) => {
    await PopupManager.openInstance(event.uuid)
  })
  logseq.App.registerCommandShortcut(
    { binding: 'mod+shift+m', mode: 'editing' },
    async () => {
      const block = await logseq.Editor.getCurrentBlock()
      if (block === null) return
      await PopupManager.openInstance(block.uuid, { searchMath: true })
    },
    { label: 'Math trigger', key: 'trigger' },
  )
  logseq.Editor.onInputSelectionEnd(async (event) => {
    if (logseq.settings?.disabled || !logseq.settings?.selectEdit) return
    if (logseq.settings?.selectModifier !== '<none>') {
      const pressedKeys = parent.document.body.dataset.activeKeystroke?.split('+')
      const requiredKeys = (logseq.settings?.selectModifier as string | undefined)?.split('+')
      if (pressedKeys === undefined || requiredKeys === undefined) return
      if (requiredKeys.some((k: string) => !pressedKeys.includes(k))) {
        return
      }
    }
    if (event.text.length <= 2) return
    if (!event.text.match(/^(\$+)([^$]+)\1$/)) return
    const block = await logseq.Editor.getCurrentBlock()
    if (block === null) return
    await PopupManager.openInstance(block.uuid, {
      selectionStart: event.start,
      selectionEnd: event.end,
    })
  })

  const onDollar = async (event: KeyboardEvent) => {
    if (logseq.settings?.disabled || !logseq.settings?.dollarTrigger || event.key !== '$') return
    const caret = await logseq.Editor.getEditingCursorPosition()
    if (caret === null) return
    // HACK: use textContent from #mock-text for faster response
    // because block content from getCurrentBlock can be old.
    // i.e. if typed 'hello $$', it might return 'hello'.
    const blockContent = parent.document.getElementById('mock-text')?.textContent
    const block = await logseq.Editor.getCurrentBlock()
    if (block === null) return
    if (caret.pos > 1 && blockContent?.charAt(caret.pos - 2) === '$') {
      await PopupManager.openInstance(block.uuid)
    }
  }
  parent.addEventListener('keydown', onDollar)

  logseq.beforeunload(async () => {
    parent.removeEventListener('keydown', onDollar)
    removeMathlive()
  })
}

logseq.ready(main).catch(logseq.UI.showMsg)
