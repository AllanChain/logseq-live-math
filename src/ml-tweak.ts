import type { MathfieldElement, Keybinding } from 'mathlive'

export function configureMF(mfe: MathfieldElement) {
  mfe.smartFence = logseq.settings?.smartFence ?? true
  mfe.smartMode = logseq.settings?.smartMode ?? false
  mfe.smartSuperscript = logseq.settings?.smartSuperscript ?? false
  try {
    mfe.keybindings = [
      ...mfe.keybindings.filter(
        (keybinding) =>
          !logseq.settings?.keybindings.some(
            (k: Keybinding) =>
              k.key === keybinding.key &&
              k.ifMode === keybinding.ifMode &&
              k.ifLayout === keybinding.ifLayout &&
              k.ifPlatform === keybinding.ifPlatform,
          ),
      ),
      ...logseq.settings?.keybindings,
    ]
  } catch (err) {
    logseq.UI.showMsg(`Fail to configure MathLive keybindings: ${err}`, 'error')
  }
  try {
    mfe.inlineShortcuts = {
      ...(logseq.settings?.disableDefaultShortcuts ? null : mfe.inlineShortcuts),
      ...logseq.settings?.inlineShortcuts,
    }
  } catch (err) {
    logseq.UI.showMsg(`Fail to configure MathLive inline shortcuts: ${err}`, 'error')
  }
}
