import type { UIBaseOptions } from '@logseq/libs/dist/LSPlugin.user'
import type { MathfieldElement } from 'mathlive'
import { configureMF } from './ml-tweak'

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function openPopup(
  uuid: string,
  opts?: {
    selectionStart?: number
    selectionEnd?: number
    searchMath?: boolean
  },
) {
  const textarea = parent.document.querySelector<HTMLTextAreaElement>(`textarea[id$="${uuid}"]`)
  if (textarea == null) {
    console.warn('[live-math] Block changed!')
    return
  }
  const blockContent = textarea.value
  let dollarEnd = opts?.selectionEnd ?? textarea.selectionEnd
  let dollarStart = opts?.selectionStart ?? textarea.selectionStart
  let originalValue = ''
  let delim = logseq.settings?.preferDisplay ? '$$' : '$'
  let newline = logseq.settings?.preferMultiline ? '\n' : ''

  if (opts?.searchMath && dollarStart === dollarEnd) {
    for (const match of blockContent.matchAll(/(\$+)([^$]+)\1/g)) {
      if (match.index! <= dollarStart && dollarStart <= match.index! + match[0].length) {
        dollarStart = match.index!
        dollarEnd = dollarStart + match[0].length
      }
    }
  }

  const originalContent = textarea.value.substring(dollarStart, dollarEnd)

  while (blockContent.charAt(dollarEnd) === '$') dollarEnd++
  while (blockContent.charAt(dollarStart - 1) === '$') dollarStart--
  const contentBefore = blockContent.substring(0, dollarStart)
  const contentAfter = blockContent.substring(dollarEnd, blockContent.length)

  if (originalContent) {
    const match = originalContent.match(/^(?<delim>\$+)(?<newline>\n*)(?<content>.*)\2\1$/s)
    if (match !== null && match.groups !== undefined) {
      originalValue = match.groups.content
      delim = match.groups.delim
      // Only `$$` has multiline preference
      if (delim !== '$') newline = match.groups.newline
    }
  } else if (logseq.settings?.smartFormat && contentBefore.length > 0) {
    if (contentBefore[contentBefore.length - 1] === '\n') delim = '$$'
    else delim = '$'
  }

  // Insert a background screen to capture clicks
  const BG_SCREEN_ID = 'logseq-live-math--popup-screen'
  let oldBgScreen = parent.document.getElementById(BG_SCREEN_ID)
  if (oldBgScreen !== null) {
    parent.document.body.removeChild(oldBgScreen)
  }
  const bgScreen = parent.document.createElement('div')
  bgScreen.id = BG_SCREEN_ID
  parent.document.body.appendChild(bgScreen)

  // Make sure the previous one is closed,
  // so that Logseq will honor the style provided.
  logseq.provideUI({ key: 'popup', template: '' })
  logseq.provideUI({
    key: 'popup',
    template: '<span></span>',
    style: await calcAlign({
      multiline: delim === '$$' && !!newline,
      renew: true,
    }),
    attrs: {
      title: 'Click title to switch display and inline style',
    },
  })
  await sleep(0)
  const popupContent = parent.document.getElementById('logseq-live-math--popup')
  if (popupContent === null) return
  const floatContent = popupContent.querySelector<HTMLDivElement>('.ls-ui-float-content')
  if (floatContent === null) return

  floatContent.title = '' // Only show the tooltip on hovering title bar, not content
  // Avoid triggering resizing when clicking on MathLive menu
  floatContent.addEventListener('pointerdown', (event) => event.stopPropagation())

  const mfe = parent.document.createElement('math-field') as MathfieldElement
  mfe.style.display = 'block'
  floatContent.prepend(mfe)
  // Adding value before mfe was added to the DOM
  // will make `focus()` selecting the whole formula
  mfe.value = originalValue
  if (logseq.settings?.inlinePreview && delim === '$') {
    mfe.defaultMode = 'inline-math'
  }

  const delimSwitch = parent.document.createElement('button')
  delimSwitch.innerText = delim === '$' ? 'Inline Math' : 'Display Math'
  delimSwitch.classList.add('delim-switch')
  const popupTitle = popupContent.querySelector('.th > .l > h3')
  popupTitle?.replaceChildren(delimSwitch)

  const actionsDiv = parent.document.createElement('div')
  actionsDiv.classList.add('actions')
  const clearButton = parent.document.createElement('button')
  clearButton.innerHTML = '&#xef88; Clear'
  clearButton.title = 'Empty this math'
  clearButton.classList.add('clear-button')
  actionsDiv.appendChild(clearButton)
  const resetButton = parent.document.createElement('button')
  resetButton.innerHTML = '&#xea0c; Reset'
  resetButton.title = 'Reset as before your edit'
  resetButton.classList.add('reset-button')
  if (originalContent.length === 0) resetButton.disabled = true
  actionsDiv.appendChild(resetButton)
  const confirmButton = parent.document.createElement('button')
  confirmButton.innerHTML = '&#xea5e; Done'
  confirmButton.title = 'Finish editing'
  confirmButton.classList.add('confirm-button')
  actionsDiv.appendChild(confirmButton)
  floatContent.appendChild(actionsDiv)

  await sleep(0)
  mfe.focus()
  configureMF(mfe)

  await sleep(0)

  async function applyAlign() {
    const styles = await calcAlign({ multiline: delim === '$$' && !!newline })
    if (styles === undefined) return
    if (popupContent === null) return

    Object.entries(styles).forEach(([k, v]) => {
      popupContent.style.setProperty(k, v)
    })
    popupContent.dataset.dx = '0'
    popupContent.dataset.dy = '0'
    popupContent.style.transform = 'unset'
  }

  applyAlign() // Resize box based on originalContent

  parent.addEventListener('resize', applyAlign)
  // keep block in editing mode after mousedown
  popupContent.addEventListener('mousedown', (event) => event.stopPropagation())
  popupContent.querySelector('.draggable-handle')?.addEventListener('mouseup', applyAlign)

  let done = false
  const wrapLaTeX = (latex: string) => {
    // HACK: `\displaylines` is not supported by KaTeX.
    const matchLines = latex.match(/^\{\\displaylines(?<content>.*)\}$/s)
    if (matchLines !== null && matchLines.groups !== undefined) {
      latex = `\\begin{gather*}${matchLines.groups.content}\\end{gather*}`
    }
    if (delim !== '$' && logseq.settings?.preferMultiline) {
      latex = latex
        .replaceAll('\\\\ ', '\\\\\n') // add new line after `\\`
        .replaceAll(/(\\begin\{[^}]+\})/g, '\n$1\n') // `\begin` command on separate line
        .replaceAll(/(\\end\{[^}]+\})/g, '\n$1\n')
        .replaceAll(/\n+/g, '\n') // Trim extra `\n` between `\end` and `\begin`
        .trim() // Trim extra `\n` at beginning
    }
    return delim === '$' ? delim + latex + delim : delim + newline + latex + newline + delim
  }
  const updateLaTeX = async () => {
    const insertedText = wrapLaTeX(mfe.getValue('latex-expanded'))
    const contentBeforeCaret = mfe.value ? contentBefore + insertedText : contentBefore
    await logseq.Editor.updateBlock(uuid, contentBeforeCaret + contentAfter)
    return contentBeforeCaret
  }
  const switchMode = async () => {
    delim = delim === '$' ? '$$' : '$'
    delimSwitch.innerText = delim === '$' ? 'Inline Math' : 'Display Math'
    if (logseq.settings?.inlinePreview) {
      mfe.defaultMode = delim === '$' ? 'inline-math' : 'math'
      mfe.value = mfe.value // update
    }
    await updateLaTeX()
  }
  let mouseMovement = ''
  // Avoid firing click after dragging
  delimSwitch.addEventListener('mousedown', (event) => {
    mouseMovement = `${event.x},${event.y}`
  })
  delimSwitch.addEventListener('mouseup', async (event) => {
    if (mouseMovement !== `${event.x},${event.y}`) return
    mouseMovement = ''
    await switchMode()
  })
  mfe.addEventListener('keydown', async (event) => {
    if (event.key === '$' && event.ctrlKey) {
      await switchMode()
    }
    event.stopPropagation()
  })
  clearButton.addEventListener('click', async () => {
    mfe.value = ''
    await updateLaTeX()
  })
  resetButton.addEventListener('click', async () => {
    mfe.value = originalContent
    await logseq.Editor.updateBlock(uuid, contentBefore + originalContent + contentAfter)
  })
  mfe.onExport = (mfe, _, range) => wrapLaTeX(mfe.getValue(range, 'latex-expanded'))
  mfe.addEventListener('input', async () => {
    await applyAlign()
    if (mfe.value.includes('placeholder')) return // not a complete formula
    await updateLaTeX()
  })
  mfe.addEventListener('unmount', async () => {
    parent.removeEventListener('resize', applyAlign)
    parent.document.body.removeChild(bgScreen)
  })
  const insertLaTeX = async () => {
    if (done) return // avoid insert twice
    done = true
    logseq.provideUI({ key: 'popup', template: '' }) // close popup
    const contentBeforeCaret = await updateLaTeX()
    // NOTE: `Editor.editBlock` doesn't focus if the textarea exists,
    // so we need to focus using DOM operations.
    if (parent.document.contains(textarea)) {
      textarea.focus()
      textarea.selectionStart = contentBeforeCaret.length
      textarea.selectionEnd = contentBeforeCaret.length
    } else {
      logseq.Editor.editBlock(uuid, { pos: contentBeforeCaret.length })
    }
  }
  confirmButton.addEventListener('click', insertLaTeX)
  mfe.addEventListener('change', async () => {
    // Ignore focus lost
    if (!mfe.hasFocus()) return
    await insertLaTeX()
  })
  bgScreen.addEventListener('click', insertLaTeX)
  popupContent.addEventListener('keydown', async (event) => {
    if (event.target !== mfe && event.key === 'Enter') {
      await insertLaTeX()
    }
    // avoid Logseq catching keydown, e.g. `(`
    event.stopPropagation()
  })
}

interface PopupAlign {
  width: number
  marginLeft: number
  marginRight: number
  left: number
  top: number
  bottom: number
}

function parseStyle(s: string): number {
  return parseInt(s.substring(0, s.length - 2), 10)
}

async function calcAlign(opt?: {
  multiline?: boolean
  renew?: boolean
}): Promise<UIBaseOptions['style']> {
  const popupMinHeight = 100
  const popupTopMargin = opt?.multiline ?? false ? 60 : 30
  const popupBottomMargin = 20
  const popupDefaultWidth = 300
  const clientWidth = parent.document.documentElement.clientWidth
  const clientHeight = parent.document.documentElement.clientHeight
  const popupContent = parent.document.getElementById('logseq-live-math--popup')
  let popup: PopupAlign
  if (popupContent === null || opt?.renew) {
    const caret = await logseq.Editor.getEditingCursorPosition()
    if (caret === null) {
      console.error('Error getting cursor pos')
      return
    }
    popup = {
      width: popupDefaultWidth,
      marginLeft: 10,
      marginRight: 10,
      left: 0,
      top: 0,
      bottom: 0,
    }
    popup.left = caret.rect.left + caret.left - popup.width / 4 - popup.marginLeft
    popup.top = caret.rect.top + caret.top + popupTopMargin
  } else {
    const mlContent = popupContent
      .querySelector('math-field')
      ?.shadowRoot?.querySelector('.ML__content') as HTMLElement | null | undefined
    // NOTE: 10 means don't expand until content exceed by 10, AND shrink at step of 10
    const widthToExpand = mlContent ? mlContent.scrollWidth - mlContent.offsetWidth - 10 : 0
    popup = {
      width: Math.max(popupDefaultWidth, popupContent.offsetWidth + widthToExpand),
      marginLeft: parseStyle(popupContent.style.marginLeft),
      marginRight: parseStyle(popupContent.style.marginLeft),
      left: parseStyle(popupContent.style.left) + parseInt(popupContent.dataset.dx ?? '0'),
      top:
        popupContent.style.top === 'initial'
          ? 0
          : parseStyle(popupContent.style.top) + parseInt(popupContent.dataset.dy ?? '0'),
      bottom:
        popupContent.style.bottom === 'initial'
          ? 0
          : parseStyle(popupContent.style.bottom) - parseInt(popupContent.dataset.dy ?? '0'),
    }
  }
  if (popup.width + popup.marginLeft + popup.marginRight > clientWidth) {
    popup.left = 0
    popup.width = clientWidth - popup.marginLeft - popup.marginRight
  } else {
    if (popup.left < 0) {
      popup.left = popup.marginLeft
    }
    if (popup.left + popup.width + popup.marginRight > clientWidth) {
      popup.left = clientWidth - popup.marginRight - popup.width
    }
  }
  if (popup.top < 0) popup.top = popupTopMargin
  if (popup.bottom < 0) popup.bottom = popupBottomMargin
  if (popup.top !== 0 && popup.top + popupMinHeight > clientHeight) {
    popup.bottom = clientHeight - popup.top + popupTopMargin + popupBottomMargin
    popup.top = 0
  }
  if (popup.bottom !== 0 && popup.bottom + popupMinHeight > clientHeight) {
    popup.top = popupTopMargin
    popup.bottom = 0
  }
  return {
    left: popup.left + 'px',
    top: popup.top ? popup.top + 'px' : 'initial',
    bottom: popup.bottom ? popup.bottom + 'px' : 'initial',
    width: popup.width + 'px',
    marginLeft: popup.marginLeft + 'px',
    marginRight: popup.marginRight + 'px',
  }
}
