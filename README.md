# lol element

![npm (scoped)](https://img.shields.io/npm/v/@iconstorm/lol-element) ![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@iconstorm/lol-element)

A base class for creating Web Components like you know what you're doing.

## Install

With npm (or similar):

```
npm install @iconstorm/lol-element
```

Via CDN, you can use a script tag:

```html
<script src="https://unpkg.com/@iconstorm/lol-element"></script>
<script>
  const { LOL, css, html } = lol // global window.lol is made available
</script>
```

or hotlink in your ES modules:

```js
import { LOL, css, html } from 'https://unpkg.com/@iconstorm/lol-element?module'
```

## Usage

> If you're starting with Web Components and custom HTML elements, please go read the chapter dedicated to them on [the great javascript.info site](https://javascript.info/custom-elements). Once you're familiar with custom elements in general, you'll be enjoying LOL within minutes.

No build step or transpiling is necessary. All of this just works in the browser.

```js
import { LOL, html, css } from '@iconstorm/lol-element'

class HelloWorld extends LOL {
  static attributes = [
    { name: 'with-exclamation-mark', boolean: true }
  ]

  static get styles () {
    return css`
      span { font-size: 300%; }
    `
  }

  template () {
    return html`
      <span>Hello World${this.withExclamationMark ? '!' : ''}</span>
    `
  }
}

customElements.define('lol-hello-world', HelloWorld)
```

🍩 [Try this on CodePen.](https://codepen.io/acstll/pen/oNWNrgb)

## API

### The `LOL` class

#### static `shadowOptions`
TODO

#### static `styles()`
TODO

#### static `attributes`
TODO

#### `template()`
TODO `template(host: Object)`

#### `changed()`
TODO `changed(name: string, oldValue: string, newValue: string)`

#### `{propertyName}Changed()`
TODO `{propertyName}Changed(oldValue: string, newValue: string)`

#### `emit()`
TODO `emit(eventName: string, detail: any, options: CustomEventInit)`

#### `render()`
TODO

#### `renderRoot`
TODO

### Lifecycle callbacks

Apart from `changed()` and `{propertyName}Changed()`, no other lifecycle callbacks are provided other than the ones offered by default in HTMLElement:

- `constructor()`
- `connectedCallback()`
- `disconnectedCallback()`
- `attributeChangedCallback()`
- `adoptedCallback()`

> See [Using the lifecycle callbacks](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks) in MDN.

### Template syntax

See [µhtml](https://www.npmjs.com/package/uhtml) for now.

### Named exports

- `LOL` - extends `LOLElement`, 
- `LOLElement` - extends `HTMLELement`, `render()` is empty
- `css`
- `html`*
- `svg`*

*implementation may vary depending on _flavor_.

## License

MIT
