# lol element

> A base class for creating Web Components like you know what you're doing

TODO

(hint: hide verbose/advanced stuff and/or further explanations inside "toggles" and the end of each section, à la Josh Comeau)

---

```js
import { LOL, html, css } from 'lol-element/lol.js'

class HelloWorld extends LOL {
  static attributes = [
    { name: 'with-exclamation-mark', boolean: true }
  ]

  static get styles () {
    return css`
      :host { font-size: 300%; }
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

---

## API draft

### component class

#### config
- static `shadowOptions`
- static `styles`
- static `attributes`
- `template()`

#### lifecycle
- `constructor()`
- `connectedCallback()`
- `disconnectedCallback()`
- `attributeChangedCallback()`
- `changed()`
- `{propertyName}Changed()`
- `render()`

#### helpers
- `emit()`

#### props
- renderRoot

### template syntax

- attributes/properties
- events
- refs

### exports

- `LOL`
- `LOLElement`
- `css`
- `html`*
- `svg`*

flavors (view layer)
- default ([µhtml](https://www.npmjs.com/package/uhtml)) 3K
- lit-html 4K
- Preact 4K
- roll your own

---

https://www.urbandictionary.com/define.php?term=lol (4)

used to make something sound less serious or more of a joke even if it's not. similarly used: haha, lmao, lmfao  
are you okay?  
yeah lol

ur not mad right?  
no lol

🍩