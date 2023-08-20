import '@logseq/libs'
import { MathfieldElement } from 'mathlive'
import styleCSS from './style.css'

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function injectMathLive() {
  if (window.top === null) return
  const script = window.top.document.createElement('script')
  script.setAttribute('src', `${logseq.baseInfo.lsr}dist/mathlive.min.js`)
  window.top.document.body.appendChild(script)
}

async function openPopup (uuid: string) {
  const block = await logseq.Editor.getBlock(uuid)
  if (block === null) return
  const caret = await logseq.Editor.getEditingCursorPosition()
  if (caret === null) {
    logseq.UI.showMsg('Error getting cursor pos')
    return
  }
  const clientWidth = parent.document.documentElement.clientWidth
  const clientHeight = parent.document.documentElement.clientHeight
  const popup = {
    width: 200,
    marginLeft: 10,
    marginRight: 10,
    left: 0,
    top: 0,
    bottom: 0,
  }
  const popupMinHeight = 100
  const popupTopMargin = 20
  popup.left = caret.rect.left + caret.left - popup.width / 2 - popup.marginLeft
  popup.top = caret.rect.top + caret.top + popupTopMargin
  console.log(clientWidth, popup.left)
  if (popup.width + popup.width * 2 > clientWidth) {
    popup.left = popup.marginLeft
    popup.width = clientWidth - popup.marginLeft - popup.marginRight
  } else {
    if (popup.left < 0) {
      popup.left = popup.marginLeft
    }
    if (popup.left + popup.width + popup.marginRight > clientWidth) {
      popup.left = clientWidth - popup.marginRight - popup.width
      console.log(popup.left)
    }
    if (popup.top + popupMinHeight > clientHeight) {
      popup.bottom = clientHeight - popup.top + 2 * popupTopMargin
      popup.top = 0
    }
  }
  logseq.provideUI({
    key: 'popup',
    template: '<button>DONE</button>',
    style: {
      left: popup.left + 'px',
      top: popup.top ? popup.top + 'px' : 'initial',
      bottom: popup.bottom ? popup.bottom + 'px' : 'initial',
      width: popup.width + 'px',
      marginLeft: popup.marginLeft + 'px',
      marginRight: popup.marginRight + 'px',
    },
    attrs: {
      title: 'Live Math'
    }
  })
  setTimeout(() => {
    const floatContent = parent.document.querySelector('#logseq-live-math--popup > .ls-ui-float-content')

    if (floatContent === null) return

    // avoid Logseq catching keydown
    floatContent.addEventListener('keydown', (event) => event.stopPropagation())

    const mfe = new MathfieldElement()
    mfe.style.display = 'block'
    floatContent.prepend(mfe)
    setTimeout(() => mfe.focus(), 100)

    let done = false
    const insertLaTeX = async () => {
      if (done) return // avoid insert twice
      done = true
      logseq.provideUI({ key: 'popup', template: '' }) // close popup
      await logseq.Editor.editBlock(uuid, { pos: caret.pos })
      setTimeout(() => logseq.Editor.insertAtEditingCursor(`$${mfe.value}$`), 100)
    }
    mfe.addEventListener('change', insertLaTeX)
    const btn = floatContent.querySelector<HTMLButtonElement>('button')
    btn?.addEventListener('click', insertLaTeX)
  })
}

function main () {
  injectMathLive()
  console.log(styleCSS)
  logseq.provideStyle(styleCSS)
  logseq.Editor.registerSlashCommand('math', async (event) => {
    openPopup(event.uuid)
  })
  parent.addEventListener('keydown', async (event) => {
    if (event.key !== '$') return
    const caret = await logseq.Editor.getEditingCursorPosition()
    if (caret === null) return
    // HACK: use textContent from #mock-text for faster response
    // because block content from getCurrentBlock can be old.
    // i.e. if typed 'hello $$', it might return 'hello'.
    const blockContent = parent.document.getElementById('mock-text')?.textContent
    const block = await logseq.Editor.getCurrentBlock()
    if (block === null) return
    console.log(caret.pos, blockContent)
    if (caret.pos > 1 && blockContent?.charAt(caret.pos - 2) === '$') {
      openPopup(block.uuid)
    }
  })
}

logseq.ready(main).catch(logseq.UI.showMsg)
