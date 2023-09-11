import type { MathfieldElement } from 'mathlive'

export function configureMF(mfe: MathfieldElement) {
  try {
    mfe.keybindings = [
      ...mfe.keybindings,
      ...logseq.settings?.keybindings,
    ]
  } catch (err) {
    logseq.UI.showMsg(`Fail to configure MathLive keybindings: ${err}`)
  }
  try {
    mfe.inlineShortcuts = {
      ...mfe.inlineShortcuts,
      ...logseq.settings?.inlineShortcuts,
    }
  } catch (err) {
    logseq.UI.showMsg(`Fail to configure MathLive inline shortcuts: ${err}`)
  }
}
