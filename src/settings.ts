import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'

export const settingsConfig: SettingSchemaDesc[] = [
  {
    title: 'Enable `$$` trigger',
    description:
      'MathLive will popup if `$$` is typed. You can still use inline math by unchecking `preferDisplay`',
    key: 'dollarTrigger',
    type: 'boolean',
    default: true,
  },
  {
    title: 'Prefer display mode',
    description: 'When enabled, math will be inserted as display mode, i.e. `$$`',
    key: 'preferDisplay',
    type: 'boolean',
    default: false,
  },
  {
    title: 'Prefer multiline for display math',
    description: 'Use `$$\\n...\\n$$` instead of `$$...$$`',
    key: 'preferMultiline',
    type: 'boolean',
    default: false,
  },
  {
    title: 'Enable select-and-edit',
    description: 'For example, when you select `$\\frac12$`, MathLive will pop up',
    key: 'selectEdit',
    type: 'boolean',
    default: true,
  },
  {
    title: 'Key bindings',
    description:
      'Configure [MathLive keybindings](https://cortexjs.io/mathlive/guides/shortcuts/#key-bindings)',
    key: 'keybindings',
    type: 'object',
    default: [],
  },
  {
    title: 'Inline shortcuts',
    description:
      'Configure [MathLive inline shortcuts](https://cortexjs.io/mathlive/guides/shortcuts/#inline-shortcuts)',
    key: 'inlineShortcuts',
    type: 'object',
    default: {},
  },
]
