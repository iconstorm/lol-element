/* global QUnit */

import { LOL, html, css } from '../src/uhtml/lol.js'

// A random name for elements to avoid collisions
const getRandomElementName = () => `lol-${Date.now()}-${Math.random().toString().substr(2)}`

/*
  - [x] html renders
  - [x] getters/setters properties are defined and are camel-cased
  - [ ] getters/setters are overwritable individually
  - [x] reflect=false works as expected
  - [x] boolean attributes work as expected
  - [ ] shadowOptions get passed
  - [x] styles get applied
  - [ ] styles are composable
  - [ ] wo/ shadow DOM
    - [ ] html renders
    - [x] styles get applied
  - [ ] changed callback gets called with arguments
  - [ ] {attributeName}Changed callbacks fire, returning false skips update
  - [ ] attribute changes triggers render (once)
  - [ ] read/write work as expected
  - [ ] #emit is cool

  - [ ] test other flavors
*/

QUnit.module('template()', ({ before, after }) => {
  let el
  const name = getRandomElementName()

  class Thanks extends LOL {
    template () {
      return html`<h1>Thanks</h1>`
    }
  }

  before(() => {
    customElements.define(name, Thanks)
    el = document.createElement(name)
    document.body.appendChild(el)
  })

  after(() => {
    document.body.removeChild(el)
  })

  QUnit.test('renders markup', assert => {
    const h1 = el.shadowRoot.querySelector('h1')
    assert.strictEqual(h1.textContent, 'Thanks')
    assert.equal(el.shadowRoot.querySelectorAll('h1').length, 1)
  })
})

QUnit.module('static attributes', ({ before, after }) => {
  let el, container
  const name = getRandomElementName()

  class Thanks extends LOL {
    static attributes = [
      'name',
      { name: 'age', reflect: false },
      { name: 'two-words', boolean: true },
      { name: 'secret', fallbackValue: 42 },
      { name: 'long-attribute-name' }
    ]

    template () {
      return html`<h1 class=${this.longAttributeName}>Thanks, ${this.name}</h1>`
    }
  }

  before(() => {
    customElements.define(name, Thanks)
    container = document.createElement('div')
    container.innerHTML = `
      <${name} name="Joe" age="10"></${name}>
    `
    document.body.appendChild(container)
    el = container.querySelector(name)
  })

  after(() => {
    document.body.removeChild(container)
  })

  QUnit.test('are reflected (get)', assert => {
    const h1 = el.shadowRoot.querySelector('h1')
    assert.strictEqual(h1.textContent, 'Thanks, Joe')
  })

  QUnit.test('are reflected (set)', assert => {
    const h1 = el.shadowRoot.querySelector('h1')
    el.name = 'Jane'
    assert.strictEqual(h1.textContent, 'Thanks, Jane')
  })

  QUnit.test('are not reflected when `reflect` option is false', assert => {
    assert.notOk(el.age)
  })

  QUnit.test('are reflected with default value', assert => {
    assert.equal(el.secret, 42)
    el.secret = null
    assert.equal(el.secret, 'null')
  })

  QUnit.test('can be booleans', assert => {
    assert.equal(el.twoWords, false)
  })

  QUnit.test('are camelCased correctly', assert => {
    const h1 = el.shadowRoot.querySelector('h1')
    el.longAttributeName = 'beep'
    assert.equal(h1.className, 'beep')
  })
})

QUnit.module('static styles()', ({ before, after }) => {
  let el
  const name = getRandomElementName()

  class Please extends LOL {
    static get styles () {
      return css`h1 { color: tomato }`
    }

    template () {
      return html`<h1>Please</h1>`
    }
  }

  before(() => {
    customElements.define(name, Please)
    el = document.createElement(name)
    document.body.appendChild(el)
  })

  after(() => {
    document.body.removeChild(el)
  })

  QUnit.test('get applied', assert => {
    const h1 = el.shadowRoot.querySelector('h1')
    const styles = getComputedStyle(h1)
    assert.strictEqual(styles.color, 'rgb(255, 99, 71)')
  })
})

QUnit.module('static styles() w/o shadow DOM', ({ before, after }) => {
  let el
  const name = getRandomElementName()

  class Please extends LOL {
    static get shadowOptions () {
      return null
    }

    static get styles () {
      return css`h1 { color: tomato }`
    }

    template () {
      return html`<h1>Please</h1>`
    }
  }

  before(() => {
    customElements.define(name, Please)
    el = document.createElement(name)
    document.body.appendChild(el)
  })

  after(() => {
    document.body.removeChild(el)
  })

  QUnit.test('get applied', assert => {
    const h1 = el.querySelector('h1')
    const styles = getComputedStyle(h1)
    assert.strictEqual(styles.color, 'rgb(255, 99, 71)')
  })
})
