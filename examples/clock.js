import { LOL, html, css } from '../src/uhtml/lol.js'

class Clock extends LOL {
  static attributes = [
    'timeout',
    { name: 'mute', boolean: true }
  ]

  static get styles () {
    return css`
      :host {
        --color: hsl(330deg 100% 50%);
      }
      span {
        font-family: sans-serif;
        font-size: 500%;
        color: var(--color);
        cursor: default;
      }
      :host([mute]) span {
        opacity: 0.2;
      }
    `
  }

  constructor () {
    super()
    this.interval = setInterval(() => {
      this.render()
    }, this.timeout)
  }

  connectedCallback () {
    super.connectedCallback()
    console.log('🍩')
  }

  disconnectedCallback () {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }

  template () {
    return html`
      <span @click=${this.toggleMute}>
        ${new Date().toLocaleTimeString()}
      </span>
    `
  }

  toggleMute = () => {
    this.mute = !this.mute
  }
}

customElements.define('lol-clock', Clock)
