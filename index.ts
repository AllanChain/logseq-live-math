import '@logseq/libs'
import { MathfieldElement } from 'mathlive'
import styleCSS from './style.css'

function injectMathLive() {
  if (window.top === null) return
  const script = window.top.document.createElement('script')
  script.setAttribute('src', `${logseq.baseInfo.lsr}dist/mathlive.min.js`)
  window.top.document.body.appendChild(script)
}

function main () {
  injectMathLive()
  console.log(styleCSS)
  logseq.provideStyle(styleCSS)
  logseq.Editor.registerSlashCommand('math', async (event) => {
    // const textarea = document.querySelector(`textarea[id$="${event.uuid}"]`)
    // logseq.UI.showMsg('LaTeX!\n' + event.uuid)
    const caret = await logseq.Editor.getEditingCursorPosition()
    if (caret === null) {
      logseq.UI.showMsg('Error getting cursor pos')
      return
    }
    logseq.provideUI({
      key: 'popup',
      template: '<button>DONE</button>',
      style: {
        left: caret.rect.left + caret.left + 'px',
        top: caret.rect.top + caret.top + 10 + 'px',
        width: '200px',
      },
      attrs: {
        title: 'Live Math'
      }
    })
    setTimeout(() => {
      const floatContent = parent.document.querySelector('#logseq-live-math--popup > .ls-ui-float-content')

      if (floatContent === null) return

      const mfe = new MathfieldElement()
      mfe.style.display = 'block'
      mfe.value = '\\frac{1}{2}'
      floatContent.prepend(mfe)
      setTimeout(() => mfe.focus(), 100)

      const done = async () => {
        logseq.provideUI({ key: 'popup', template: '' }) // close popup
        await logseq.Editor.editBlock(event.uuid, { pos: caret.pos })
        setTimeout(() => logseq.Editor.insertAtEditingCursor(`$${mfe.value}$`), 100)
      }
      mfe.addEventListener('change', done)
      const btn = floatContent.querySelector<HTMLButtonElement>('button')
      btn?.addEventListener('click', done)
    })
  })
}

logseq.ready(main).catch(logseq.UI.showMsg)
