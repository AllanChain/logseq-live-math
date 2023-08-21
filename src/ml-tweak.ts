import type { MathfieldElement } from 'mathlive'

export function configureMF(mfe: MathfieldElement) {
  try {
    mfe.keybindings = [
      ...mfe.keybindings.map((keybinding) => {
        switch (keybinding.key) {
          case 'alt+d':
            return { ...keybinding, command: ['insert', '\\mathrm{d}'] }
          default:
            return keybinding
        }
      }),
      ...logseq.settings?.keybindings,
    ]
  } catch (err) {
    logseq.UI.showMsg(`Fail to configure MathLive keybindings: ${err}`)
  }
  try {
    mfe.inlineShortcuts = {
      ...Object.entries(mfe.inlineShortcuts).reduce((shortcuts, [k, v]) => {
        if (typeof v === 'object') {
          v.value = v.value.replace('differentialD', 'mathrm{d}')
        }
        shortcuts[k] = v
        return shortcuts
      }, {} as typeof mfe.inlineShortcuts),
      ...mfe.inlineShortcuts,
      ...logseq.settings?.inlineShortcuts,
    }
  } catch (err) {
    logseq.UI.showMsg(`Fail to configure MathLive inline shortcuts: ${err}`)
  }
}
