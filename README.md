<p align=center>
  <img src="icon.svg" width="100">
</p>
<h1 align=center>
  Logseq Live Math
</h1>
<p align=center>
  <em>Type LaTeX in live mode!</em>
</p>
<p align=center>
  <a href="https://github.com/AllanChain/logseq-live-math/releases">
    <img src="https://img.shields.io/github/v/release/AllanChain/logseq-live-math" alt="GitHub release">
  </a>
  <img src="https://img.shields.io/github/downloads/AllanChain/logseq-live-math/total" alt="total downloads">
</p>

logseq-live-math integrates [MathLive](https://cortexjs.io/mathlive/) into Logseq, providing a better experience using Logseq with a lot of math.

![live-math-demo](.github/live-math-demo.gif)

> The above example uses [logseq-display-math](https://github.com/AllanChain/logseq-display-math) to render inline math in display style.
>
> Check it out for math render style, KaTeX macros, and more!

## Features

- ⌨️ Easy and convenient ways to trigger the MathLive input
  1. Using the `/math` command
  2. Type `$$`. Can be disabled
  3. Select the formula with the mouse (e.g. `$\frac12$`). Can be disabled
- 📝 Edit LaTeX formula with MathLive, rich, intuitive, and fast
- 🔄 Update the LaTeX formula in the block in real-time
- 🔙 Press <kbd>Enter</kbd> to confirm, close the popup to cancel and restore
- 🎨 Well-configured MathLive theme to match Logseq custom theme
- 🔧 Configurable MathLive [keybindings](https://cortexjs.io/mathlive/guides/shortcuts/#key-bindings) and [inline shortcuts](https://cortexjs.io/mathlive/guides/shortcuts/#inline-shortcuts)

## FAQ

### How is this plugin different from the `darwis-mathlive-plugin`?

[darwis-mathlive-plugin](https://github.com/hkgnp/darwis-mathlive-plugin) also integrated MathLive to Logseq, but it’s working in a different way which is not very convenient for me, as it’s not automatically converted to LaTeX and only supports display math.

### How to disable the double-dollar trigger and select-and-edit?

Go to the settings page and disable them.

For select-and-edit, it's also possible to require a modifier key to be pressed.
For example, if you configured the key to be <kbd>Shift</kbd>, then you need to hold the <kbd>Shift</kbd> key while selecting, so that the popup will show. If not holding the key, nothing will happen.

### I've selected the formula but nothing happens!

Logseq has some bugs for the `input-selection-end` event ([logseq/logseq#10106](https://github.com/logseq/logseq/issues/10106)), which means currently, you have to click on the selection again to trigger the popup ([#1 (comment)](https://github.com/AllanChain/logseq-live-math/issues/1#issuecomment-1694545308)).

### How to switch between display math (`$$`) and inline math (`$`)?

If you want to change the default style, go to the settings page and switch `preferDisplay`.

If you need to switch temporarily, you can click on the title of the popup to switch between `Inline Math` and `Display Math`.
