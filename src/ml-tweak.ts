import type { MathfieldElement } from 'mathlive'

export function configureMF(mfe: MathfieldElement) {
  mfe.smartFence = logseq.settings?.smartFence ?? true
  mfe.smartMode = logseq.settings?.smartMode ?? false
  mfe.smartSuperscript = logseq.settings?.smartSuperscript ?? false
  try {
    mfe.keybindings = [
      ...mfe.keybindings,
      ...logseq.settings?.keybindings,
    ]
  } catch (err) {
    logseq.UI.showMsg(`Fail to configure MathLive keybindings: ${err}`, 'error')
  }
  try {
    mfe.inlineShortcuts = {
      ...mfe.inlineShortcuts,
      ...logseq.settings?.inlineShortcuts,
    }
  } catch (err) {
    logseq.UI.showMsg(`Fail to configure MathLive inline shortcuts: ${err}`, 'error')
  }
}
