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
    title: 'Modifier key for select-and-edit',
    description: 'Require modifier key to be pressed for MathLive to pop up',
    key: 'selectModifier',
    type: 'enum',
    default: '<none>',
    enumPicker: 'select',
    enumChoices: ['<none>', 'Control', 'Shift', 'Alt', 'Control+Shift', 'Control+Alt', 'Shift+Alt'],
  },
  {
    title: 'Key bindings',
    description:
      'Configure [MathLive keybindings](https://cortexjs.io/mathlive/guides/shortcuts/#key-bindings).' +
      '\n\nBy default, this plugin includes `ctrl+b` to insert `\\mathbf` as an example. ' +
      "You can add your own and delete this example if you don't want it.",
    key: 'keybindings',
    type: 'object',
    default: [
      {
        key: 'ctrl+b',
        command: ['insert', '\\mathbf{#@}'],
      },
    ],
  },
  {
    title: 'Inline shortcuts',
    description:
      'Configure [MathLive inline shortcuts](https://cortexjs.io/mathlive/guides/shortcuts/#inline-shortcuts).' +
      '\n\nBy default, this plugin inserts `\\mathrm{Logseq}` when you type `Logseq` as an example. ' +
      "You can add your own and delete this example if you don't want it.",
    key: 'inlineShortcuts',
    type: 'object',
    default: {
      Logseq: '\\mathrm{Logseq}',
    },
  },
]
