import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'

export const settingsConfig: SettingSchemaDesc[] = [
  {
    title: 'Prefer display mode',
    description:
      'When enabled, math will be inserted as display mode, i.e. `$$`',
    key: 'preferDisplay',
    type: 'boolean',
    default: false,
  },
  {
    title: 'Enable select-and-edit',
    description: 'For example, when you select `$\\frac12$`, MathLive will pop up',
    key: 'selectEdit',
    type: 'boolean',
    default: 'true',
  },
  {
    title: 'Key bindings',
    description:
      'Configure [MathLive keybindings](https://cortexjs.io/mathlive/guides/shortcuts/#key-bindings)',
    key: 'keybindings',
    type: 'object',
    default: [
      {
        key: 'alt+d',
        ifMode: 'math',
        command: ['insert', '\\mathrm{d}'],
      },
    ],
  },
  {
    title: 'Inline shortcuts',
    description:
      'Configure [MathLive inline shortcuts](https://cortexjs.io/mathlive/guides/shortcuts/#inline-shortcuts)',
    key: 'inlineShortcuts',
    type: 'object',
    default: {
      dx: {
        after:
          'nothing+digit+function+frac+surd+binop+relop+punct+array+openfence+closefence+space+text',
        value: '\\mathrm{d} x',
      },
      dy: {
        after:
          'nothing+digit+function+frac+surd+binop+relop+punct+array+openfence+closefence+space+text',
        value: '\\mathrm{d} y',
      },
      dt: {
        after:
          'nothing+digit+function+frac+surd+binop+relop+punct+array+openfence+closefence+space+text',
        value: '\\mathrm{d} t',
      },
    },
  },
]
