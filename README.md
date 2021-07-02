# lol element

![npm (scoped)](https://img.shields.io/npm/v/@iconstorm/lol-element) ![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@iconstorm/lol-element)

A JavaScript base class for creating Web Components like you know what you're doing.

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

<details>
  <summary>Starting with Web Components and custom HTML elements?</summary>

  Please go read the chapter dedicated to them on [the great javascript.info site](https://javascript.info/custom-elements). Once you're familiar with custom elements in general, you'll be enjoying LOL within minutes.
  
  Also the [Classes chapter](https://javascript.info/classes) is a recommended read.
</details>

No build step or transpiling is necessary. All of this just works in the browser.

Define a component:

```js
import { LOL, html, css } from 'https://unpkg.com/@iconstorm/lol-element'

class HelloWorld extends LOL {
  static get attributes () {
    return { name: 'with-exclamation-mark', boolean: true }
  }

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

Use it in your markup:

```html
<lol-hello-world with-exclamation-mark></lol-hello-world>
```

🍩 [Try this on CodePen.](https://codepen.io/acstll/pen/oNWNrgb)

## API

- [`LOL` class](#the-lol-class)
  - [static `shadowOptions`](#static-shadowoptions-static-getter-or-property)
  - [static `attributes`](#static-attributes-static-getter-or-property)
  - [static `styles`](#static-styles-static-getter-or-property)
  - [`template()`](#template-method)
  - [`changed()`](#changed-method)
  - [`{propertyName}Changed()`](#propertynamechanged-method)
  - [`emit()`](#emit-method)
  - [`render()`](#render-method)
  - [`renderRoot`](#renderroot-property)
- [Lifecycle callbacks](#lifecycle-callbacks)
- [Template syntax](#template-syntax)
- [Named exports](#named-exports)

### The `LOL` class

#### static `shadowOptions` _static (getter or property)_

Define the [Shadow DOM options](https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow#syntax) being passed to the `attachShadow()` call.

Defaults to `{ mode: 'open' }`. Use `null` to not use Shadow DOM.

---

#### static `attributes` _static (getter or property)_

Define the element's attributes to be observed with an array of names or [config objects](https://github.com/iconstorm/lol-element/blob/main/src/lol-element.js#L157), with following keys:

- `name` string: The name of the attribute
- `reflect` boolean (default: `true`): Whether the attribute should be reflected in a property 
- `boolean` boolean (default: `false`): Whether the attribute is a [boolean type of attribute](https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/Getting_started#boolean_attributes)
- `read` function (default: `x => x`): A function to process the property value being accessed
- `write` function (default: `x => x`): A function to process the value being set in the attribute
- `fallbackValue`: The value returned by the property getter when the attribute is missing

Except for `name`, all options are optional.

An attribute being reflected means that for a given `foo-bar` attribute, a `fooBar` getter/setter property will be created. So assigning a value to `fooBar` will set the same value to the `foo-bar` attribute. `LOL` has no observable/reactivity system, for simplicity's sake, it leverages the browser's via `attributeChangedCallback`.

<details>
  <summary>Attributes and props?</summary>

  Attributes live in HTML, properties belong in JavaScript objects. If the different is not clear, [stack overflow is your friend](https://stackoverflow.com/a/6004028). This can create some confusion. This [post by Rich Harris](https://dev.to/richharris/why-i-don-t-use-web-components-2cia) can be interesting (scroll down to part 6).
</details>

---

#### static `styles` _static (getter or property)_

Define the styles for the component with CSS. The ` css`` ` template literal tag must be used.

<details>
  <summary>Example</summary>

  ```js
  import { css } from '@iconstorm/lol-element'
  
  // ..
  
  static get styles() {
    return css`
      :host {
        font-size: 100%;
      }
    `
  }
  ```
</details>

---

#### `template()` _method_

Define the markup of the component, the ` html`` ` template literal tag must be used.

Parameters:
- `host` object: The element instance

🔥 This method is usually called `render()` in many libraries and frameworks.

<details>
  <summary>Example</summary>

  ```js
  import { html } from '@iconstorm/lol-element'
  
  // ..
  
  template() {
    return html`
      <p>Loren ipsum</p>
    `
  }
  ```
</details>

---

#### `changed()` _method_

Fires every time an attribute is added, removed, or changed. This is only an alias for `attributeChangedCallback` for the convenience of avoiding `super.attributeChangedCallback()`.

Parameters:
- `name` string: The name of the attribute the changed
- `oldValue` string
- `newValue` string

---

#### `{propertyName}Changed()` _method_

An individual callback for every observed attribute, when implemented. For example, every time the `foo-bar` attribute changes, if there's a `fooBarChanged()` method defined, it will be called.

Parameters:
- `oldValue` string
- `newValue` string

---

#### `emit()` _method_

A helper to dispatch custom events from within the element.

Parameters:
- `eventName` string: The name of the event
- `detail` any: The thing being emitted, available in `event.detail`
- `options` object: any other options for the event, defaults to `{ bubbles: true, cancelable: true }`

---

#### `render()` _method_

Call this method to trigger a DOM update. You shouldn't need to implement this method.

---

#### `renderRoot` _property_ 

The DOM node where rendering happens. This is either the element's [`shadowRoot`](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot) (when using Shadow DOM) or the host element itself (when not).

### Lifecycle callbacks

Apart from `changed()` and `{propertyName}Changed()`, no other lifecycle callbacks are provided other than the ones offered by default in HTMLElement:

- `constructor()`
- `connectedCallback()`
- `attributeChangedCallback()`
- `disconnectedCallback()`

> See [Using the lifecycle callbacks](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks) in MDN.

<details>
  <summary>⚠️ Don't forget the `super` keyword when using these.</summary>

  If you don't call `super` on `constructor`, `connectedCallback` and `attributeChangedCallback`, things will break.

  ```js
  class MyComponent extends LOL {
    constructor() {
      super()
      // ..
    }

    connectedCallback() {
      super.connectedCallback()
      // ..
    }

    attributeChangedCallback() {
      super.attributeChangedCallback()
      // ..
    }
  } 
  ```

  More info: https://javascript.info/class-inheritance#overriding-a-method
</details>

### Template syntax

See [µhtml](https://www.npmjs.com/package/uhtml) for now.

### Named exports

- `LOL` - extends `LOLElement`, 
- `LOLElement` - extends `HTMLELement`, `render()` is not implemented
- `css`
- `html`*
- `svg`*

```js
import { LOL, LOLElement, css, html, svg } from '@iconstorm/lol-element'
```

*implementation may vary depending on _flavor_ (more on this soon).

## Thank-yous (prior art)

- [FAST](https://github.com/microsoft/fast/)
- [swiss](https://github.com/luwes/swiss)
- [Lit](https://github.com/lit/lit/)
- [Stencil](https://github.com/ionic-team/stencil)
- [hybrids](https://github.com/hybridsjs/hybrids)

## License

MIT
