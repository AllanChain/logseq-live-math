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
    title: 'Key bindings',
    description: 'Configure [MathLive keybindings](https://cortexjs.io/mathlive/guides/shortcuts/#key-bindings)',
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
