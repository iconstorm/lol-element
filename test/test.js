/* global QUnit */

/* COMPLETELY USELESS NOW, NEEDS A REWRITE */

import { LOL, html } from '../src/lol.js'

// A random name for elements to avoid collisions
const getRandomElementName = () => `a-${Date.now()}-${Math.random().toString().substr(2)}`

/*
  - [x] class with no static `definition` throws
  - [x] `definition` with no `name` throws
  - [x] LOL.define actual defines the element
  - [x] html renders w/ shadow DOM
  - [x] template as string works
  - [-] no template also works
  - [ ] styles get applied
  - [ ] wo/ shadow DOM
    - [ ] html renders
    - [ ] styles get applied
  - [ ] lifecycle callbacks get called (in right order?)
  - [ ] {attributeName}Changed callbacks fire, returning false skips update
  - [ ] getters/setters properties are defined and are camel-cased
  - [ ] reflect=false works as expected
  - [ ] boolean attributes works as expected
  - [ ] #emit is cool
  - [ ] attribute map is there and attribute objects are fine
  - [ ] #definition is accessible
*/

QUnit.module('LOL.define', () => {
  const name = getRandomElementName()

  class WithNoDef extends LOL {}

  class WithNoName extends LOL {
    static definition = {}
  }

  class NameOnly extends LOL {
    static definition = {
      name: name
    }
  }

  QUnit.test('throws with no `definition` object', assert => {
    assert.throws(() => {
      LOL.define(WithNoDef)
    },
    /'definition' object missing/)
  })
  QUnit.test('throws with no `definition.name`', assert => {
    assert.throws(() => {
      LOL.define(WithNoName)
    },
    /name for the custom element is missing/)
  })
  QUnit.test('`definition.name` is enough', assert => {
    LOL.define(NameOnly)
    assert.ok(customElements.get(name), 'and element is defined')
  })
})

QUnit.module('Definition.template', ({ before, after }) => {
  let el
  const name = getRandomElementName()

  class WithTemplateFn extends LOL {
    static definition = {
      name: name,
      template: (host) => html`
        <h1>Thank you, ${host.name}</h1>
      `
    }

    constructor () {
      super()
      this.name = 'son'
    }
  }

  before(() => {
    LOL.define(WithTemplateFn)
    el = document.createElement(name)
    document.body.appendChild(el)
  })

  after(() => {
    document.body.removeChild(el)
  })

  QUnit.test('renders markup with data from host', assert => {
    const h1 = el.shadowRoot.querySelector('h1')
    assert.ok(h1)
    assert.strictEqual(h1.textContent, 'Thank you, son')
  })
})

QUnit.module('Definition.template as string', ({ before, after }) => {
  let el
  const name = getRandomElementName()

  class WithTemplateFn extends LOL {
    static definition = {
      name: name,
      template: html`
        <h1>Thank you, everyone</h1>
      `
    }
  }

  before(() => {
    LOL.define(WithTemplateFn)
    el = document.createElement(name)
    document.body.appendChild(el)
  })

  after(() => {
    document.body.removeChild(el)
  })

  QUnit.test('renders markup', assert => {
    const h1 = el.shadowRoot.querySelector('h1')
    assert.ok(h1)
    assert.strictEqual(h1.textContent, 'Thank you, everyone')
  })
})
