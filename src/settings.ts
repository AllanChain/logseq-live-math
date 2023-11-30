import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'

export const settingsConfig: SettingSchemaDesc[] = [
  { title: 'Triggers', description: '', key: 'triggerSettings', type: 'heading', default: null },
  {
    title: 'Enable `$$` trigger',
    description: 'MathLive will popup if `$$` is typed. You can still use inline math.',
    key: 'dollarTrigger',
    type: 'boolean',
    default: true,
  },
  {
    title: 'Enable select-and-edit',
    description: 'Select the math expression (including `$`s) and MathLive will pop up.',
    key: 'selectEdit',
    type: 'boolean',
    default: true,
  },
  {
    title: 'Modifier key for select-and-edit',
    description: 'Require modifier key to be pressed while selecting for MathLive to pop up.',
    key: 'selectModifier',
    type: 'enum',
    default: '<none>',
    enumPicker: 'select',
    enumChoices: ['<none>', 'Control', 'Shift', 'Alt', 'Control+Shift', 'Control+Alt', 'Shift+Alt'],
  },
  { title: 'Formatting', description: '', key: 'formatSettings', type: 'heading', default: null },
  {
    title: 'Prefer display mode',
    description: 'When enabled, math will be inserted as display mode, i.e. `$$`.',
    key: 'preferDisplay',
    type: 'boolean',
    default: false,
  },
  {
    title: 'Prefer multiline for display math',
    description: 'Use `$$\\n...\\n$$` instead of `$$...$$` for display math.',
    key: 'preferMultiline',
    type: 'boolean',
    default: false,
  },
  {
    title: 'Smart format',
    description:
      'Determine inline or display mode for new math: ' +
      'inline for middle of the line and display for start of newline (not new block). ' +
      '`preferDisplay` option will be honored in case of ambiguity.',
    key: 'smartFormat',
    type: 'boolean',
    default: true,
  },
  { title: 'MathLive', description: '', key: 'mathliveSettings', type: 'heading', default: null },
  {
    title: 'Inline preview',
    description: 'Use inline mode of MathLive if current math is inline mode.',
    key: 'inlinePreview',
    type: 'boolean',
    default: false,
  },
  {
    title: 'Smart Fence',
    description: 'Automatically convert parentheses to `\\left...\\right` markup.',
    key: 'smartFence',
    type: 'boolean',
    default: true,
  },
  {
    title: 'Smart mode',
    description:
      'Switch to text mode when text input is detected, for example when typing `if x > 0`.',
    key: 'smartMode',
    type: 'boolean',
    default: false,
  },
  {
    title: 'Smart superscript',
    description: 'Automatically move out of a superscript when a digit is typed.',
    key: 'smartSuperscript',
    type: 'boolean',
    default: false,
  },
  {
    title: 'Key bindings',
    description:
      'Configure [MathLive keybindings](https://cortexjs.io/mathlive/guides/shortcuts/#key-bindings).' +
      '\n\nBy default, this plugin includes `ctrl+b` to insert `\\mathbf` as an example. ' +
      "You can add your own and delete this example if you don't want it.\n\n" +
      'You can also check [this discussion](https://github.com/AllanChain/logseq-live-math/discussions/14) ' +
      'for more examples.',
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
      "You can add your own and delete this example if you don't want it.\n\n" +
      'You can also check [this discussion](https://github.com/AllanChain/logseq-live-math/discussions/14) ' +
      'for more examples.',
    key: 'inlineShortcuts',
    type: 'object',
    default: {
      Logseq: '\\mathrm{Logseq}',
    },
  },
  {
    title: 'Disable default shortcuts',
    description: 'Disable default inline shortcuts defined by MathLive.',
    key: 'disableDefaultShortcuts',
    type: 'boolean',
    default: false,
  },
]
