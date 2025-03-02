import type { UIBaseOptions } from '@logseq/libs/dist/LSPlugin.user'
import type { MathfieldElement } from 'mathlive'
import { configureMF } from './ml-tweak'

interface ExtractOptions {
  selectionStart?: number
  selectionEnd?: number
  searchMath?: boolean
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const BG_SCREEN_ID = 'logseq-live-math--popup-screen'

export class PopupManager {
  public static instance: PopupManager | null = null
  public mfe: MathfieldElement | null = null
  private delimSwitch: HTMLButtonElement | null = null
  private mouseMovement = ''
  private originalValue = ''
  private delim = '$'
  private newline = ''
  private uuid = ''
  private contentBefore = ''
  private contentAfter = ''
  private originalContent = ''

  private constructor() {}

  public static getInstance(): PopupManager {
    if (PopupManager.instance === null) {
      PopupManager.instance = new PopupManager()
    }
    return PopupManager.instance
  }

  public static async openInstance(uuid: string, opts?: ExtractOptions) {
    if (PopupManager.instance?.mfe) return
    if (PopupManager.instance === null) {
      PopupManager.instance = new PopupManager()
    }
    await PopupManager.instance.open(uuid, opts)
  }

  public close() {
    // Close popup
    logseq.provideUI({ key: 'popup', template: '' })
    this.mfe = null
    this.mouseMovement = ''
    this.originalValue = ''
    this.delim = '$'
    this.newline = ''
    this.uuid = ''
    this.contentBefore = ''
    this.contentAfter = ''
    this.originalContent = ''
  }

  private async open(uuid: string, opts?: ExtractOptions) {
    this.uuid = uuid
    this.extractText(opts)
    this.setupBgScreen()
    await this.createPopup()
    await sleep(0)
    if (!this.mfe) return
    this.mfe.focus()
    configureMF(this.mfe)
    // Resize box based on originalContent
    await this.applyAlign()
  }

  private extractText(opts?: ExtractOptions) {
    const textarea = parent.document.querySelector<HTMLTextAreaElement>(
      `textarea[id$="${this.uuid}"]`,
    )
    if (textarea == null) {
      console.warn('[live-math] Block changed!')
      return
    }
    const blockContent = textarea.value
    let dollarEnd = opts?.selectionEnd ?? textarea.selectionEnd
    let dollarStart = opts?.selectionStart ?? textarea.selectionStart
    this.delim = logseq.settings?.preferDisplay ? '$$' : '$'
    this.newline = logseq.settings?.preferMultiline ? '\n' : ''

    if (opts?.searchMath && dollarStart === dollarEnd) {
      for (const match of blockContent.matchAll(/(\$+)([^$]+)\1/g)) {
        if (match.index! <= dollarStart && dollarStart <= match.index! + match[0].length) {
          dollarStart = match.index!
          dollarEnd = dollarStart + match[0].length
        }
      }
    }

    this.originalContent = textarea.value.substring(dollarStart, dollarEnd)

    while (blockContent.charAt(dollarEnd) === '$') dollarEnd++
    while (blockContent.charAt(dollarStart - 1) === '$') dollarStart--
    this.contentBefore = blockContent.substring(0, dollarStart)
    this.contentAfter = blockContent.substring(dollarEnd, blockContent.length)

    if (this.originalContent) {
      const match = this.originalContent.match(/^(?<delim>\$+)(?<newline>\n*)(?<content>.*)\2\1$/s)
      if (match !== null && match.groups !== undefined) {
        this.originalValue = match.groups.content
        this.delim = match.groups.delim
        // Only `$$` has multiline preference
        if (this.delim !== '$') this.newline = match.groups.newline
      }
    } else if (logseq.settings?.smartFormat && this.contentBefore.length > 0) {
      if (this.contentBefore[this.contentBefore.length - 1] === '\n') this.delim = '$$'
      else this.delim = '$'
    }
  }
  private setupBgScreen() {
    // Insert a background screen to capture clicks
    let oldBgScreen = parent.document.getElementById(BG_SCREEN_ID)
    if (oldBgScreen !== null) {
      parent.document.body.removeChild(oldBgScreen)
    }
    const bgScreen = parent.document.createElement('div')
    bgScreen.id = BG_SCREEN_ID
    parent.document.body.appendChild(bgScreen)

    bgScreen.addEventListener('click', this.insertLaTeX.bind(this))
  }

  private async createPopup() {
    // Make sure the previous one is closed,
    // so that Logseq will honor the style provided.
    logseq.provideUI({ key: 'popup', template: '' })
    logseq.provideUI({
      key: 'popup',
      template: '<span></span>',
      style: await calcAlign({
        multiline: this.delim === '$$' && !!this.newline,
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

    this.mfe = parent.document.createElement('math-field') as MathfieldElement
    this.mfe.style.display = 'block'
    floatContent.prepend(this.mfe)
    // Adding value before this.mfe was added to the DOM
    // will make `focus()` selecting the whole formula
    this.mfe.value = this.originalValue
    if (logseq.settings?.inlinePreview && this.delim === '$') {
      this.mfe.defaultMode = 'inline-math'
    }

    this.delimSwitch = parent.document.createElement('button')
    this.delimSwitch.innerText = this.delim === '$' ? 'Inline Math' : 'Display Math'
    this.delimSwitch.classList.add('delim-switch')
    const popupTitle = popupContent.querySelector('.th > .l > h3')
    popupTitle?.replaceChildren(this.delimSwitch)

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
    if (this.originalContent.length === 0) resetButton.disabled = true
    actionsDiv.appendChild(resetButton)
    const confirmButton = parent.document.createElement('button')
    confirmButton.innerHTML = '&#xea5e; Done'
    confirmButton.title = 'Finish editing'
    confirmButton.classList.add('confirm-button')
    actionsDiv.appendChild(confirmButton)
    floatContent.appendChild(actionsDiv)

    parent.addEventListener('resize', this.applyAlign)
    // keep block in editing mode after mousedown
    popupContent.addEventListener('mousedown', (event) => event.stopPropagation())
    popupContent.querySelector('.draggable-handle')?.addEventListener('mouseup', this.applyAlign)
    this.delimSwitch.addEventListener('mousedown', (event) => {
      this.mouseMovement = `${event.x},${event.y}`
    })
    // Avoid firing click after dragging
    this.delimSwitch.addEventListener('mouseup', async (event) => {
      if (this.mouseMovement !== `${event.x},${event.y}`) return
      this.mouseMovement = ''
      await this.switchMode()
    })
    this.mfe.addEventListener('keydown', async (event) => {
      if (event.key === '$' && event.ctrlKey) {
        await this.switchMode()
      }
      event.stopPropagation()
    })
    clearButton.addEventListener('click', async () => {
      if (!this.mfe) return
      this.mfe.value = ''
      await this.updateLaTeX()
    })
    resetButton.addEventListener('click', async () => {
      if (!this.mfe) return
      this.mfe.value = this.originalContent
      await logseq.Editor.updateBlock(
        this.uuid,
        this.contentBefore + this.originalContent + this.contentAfter,
      )
    })
    this.mfe.onExport = (mfe, _, range) => this.wrapLaTeX(mfe.getValue(range, 'latex-expanded'))
    this.mfe.addEventListener('input', async () => {
      await this.applyAlign()
      if (!this.mfe || this.mfe.value.includes('placeholder')) return // not a complete formula
      await this.updateLaTeX()
    })
    this.mfe.addEventListener('unmount', async () => {
      parent.removeEventListener('resize', this.applyAlign)
      let oldBgScreen = parent.document.getElementById(BG_SCREEN_ID)
      if (oldBgScreen !== null) {
        parent.document.body.removeChild(oldBgScreen)
      }
    })
    confirmButton.addEventListener('click', this.insertLaTeX.bind(this))
    this.mfe.addEventListener('change', async () => {
      // Ignore focus lost
      if (!this.mfe?.hasFocus()) return
      await this.insertLaTeX()
    })
    popupContent.addEventListener('keydown', async (event) => {
      if (event.target !== this.mfe && event.key === 'Enter') {
        await this.insertLaTeX()
      }
      // avoid Logseq catching keydown, e.g. `(`
      event.stopPropagation()
    })
  }
  private applyAlign = async () => {
    const popupContent = parent.document.getElementById('logseq-live-math--popup')
    if (popupContent === null) return
    const styles = await calcAlign({ multiline: this.delim === '$$' && !!this.newline })
    if (styles === undefined) return

    Object.entries(styles).forEach(([k, v]) => {
      popupContent.style.setProperty(k, v)
    })
    popupContent.dataset.dx = '0'
    popupContent.dataset.dy = '0'
    popupContent.style.transform = 'unset'
  }
  private wrapLaTeX(latex: string) {
    // HACK: `\displaylines` is not supported by KaTeX.
    const matchLines = latex.match(/^\\displaylines\{(?<content>.*)\}$/s)
    if (matchLines !== null && matchLines.groups !== undefined) {
      latex = `\\begin{gather*}${matchLines.groups.content}\\end{gather*}`
    }
    if (this.delim !== '$' && logseq.settings?.preferMultiline) {
      latex = latex
        .replaceAll('\\\\ ', '\\\\\n') // add new line after `\\`
        .replaceAll(/(\\begin\{[^}]+\})/g, '\n$1\n') // `\begin` command on separate line
        .replaceAll(/(\\end\{[^}]+\})/g, '\n$1\n')
        .replaceAll(/\n+/g, '\n') // Trim extra `\n` between `\end` and `\begin`
        .trim() // Trim extra `\n` at beginning
    }
    return this.delim === '$'
      ? this.delim + latex + this.delim
      : this.delim + this.newline + latex + this.newline + this.delim
  }
  private async insertLaTeX() {
    const contentBeforeCaret = await this.updateLaTeX()
    // NOTE: `Editor.editBlock` doesn't focus if the textarea exists,
    // so we need to focus using DOM operations.
    const textarea = parent.document.querySelector<HTMLTextAreaElement>(
      `textarea[id$="${this.uuid}"]`,
    )
    if (textarea) {
      textarea.focus()
      textarea.selectionStart = contentBeforeCaret.length
      textarea.selectionEnd = contentBeforeCaret.length
    } else {
      logseq.Editor.editBlock(this.uuid, { pos: contentBeforeCaret.length })
    }
    this.close()
  }
  private async updateLaTeX() {
    const contentBeforeCaret = this.mfe?.value
      ? this.contentBefore + this.wrapLaTeX(this.mfe.getValue('latex-expanded'))
      : this.contentBefore
    await logseq.Editor.updateBlock(this.uuid, contentBeforeCaret + this.contentAfter)
    return contentBeforeCaret
  }
  public async switchMode() {
    if (!this.mfe || !this.delimSwitch) return
    this.delim = this.delim === '$' ? '$$' : '$'
    this.delimSwitch.innerText = this.delim === '$' ? 'Inline Math' : 'Display Math'
    if (logseq.settings?.inlinePreview) {
      this.mfe.defaultMode = this.delim === '$' ? 'inline-math' : 'math'
      this.mfe.value = this.mfe.value // update
    }
    await this.updateLaTeX()
  }
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
  const popupTopMargin = (opt?.multiline ?? false) ? 60 : 30
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
