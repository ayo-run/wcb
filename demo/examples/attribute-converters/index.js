import { WebComponent, html } from 'web-component-base'

/**
 * `toAttribute` / `fromAttribute` are the escape hatch for props whose
 * reflection doesn't fit the built-in rules. Override the props you care
 * about and hand the rest to `super`.
 *
 * Two things worth noticing in this example:
 *
 *   - `when` is a `Date`, so it declares a `Date` default — the prop's runtime
 *     type comes from the default's `typeof`, and the props proxy would reject
 *     a Date written to a prop declared as a string.
 *   - `toAttribute` is deliberately lossy (it drops the time of day), which is
 *     safe: a prop write is not parsed back through `fromAttribute`, so
 *     `props.when` keeps the exact value you assigned.
 */
class EventCard extends WebComponent {
  static props = {
    when: new Date('2026-07-20T09:30:00Z'),
    tags: [],
    title: 'Release day',
  }
  // renders into a shadow root so a parent's re-render can't reconcile away
  // the children this component renders for itself
  static shadowRootInit = { mode: 'open' }

  toAttribute(name, value) {
    // ISO date only — the attribute is a summary, not the whole value
    if (name === 'when') return value.toISOString().slice(0, 10)
    // a list reflects as a readable comma-separated attribute...
    if (name === 'tags') return value.length ? value.join(',') : null
    return super.toAttribute(name, value)
  }

  fromAttribute(name, value) {
    if (name === 'when') return new Date(`${value}T00:00:00Z`)
    // ...and parses back the same way
    if (name === 'tags') return value.split(',').filter(Boolean)
    return super.fromAttribute(name, value)
  }

  get template() {
    const { when, tags, title } = this.props
    return html`
      <h3>${title}</h3>
      <p>
        prop <code>when</code> (a real Date):
        <strong>${when.toISOString()}</strong>
      </p>
      <p>
        prop <code>tags</code> (a real Array):
        <strong>${JSON.stringify(tags)}</strong>
      </p>
    `
  }
}
customElements.define('event-card', EventCard)

/**
 * Panel that drives the card and shows the attribute each conversion produces.
 */
class ConverterDemo extends WebComponent {
  static props = { log: '' }

  afterViewInit() {
    this.card = this.querySelector('event-card')
    this.#report('initial mount')
  }

  #report(action) {
    const el = this.card
    if (!el) return
    const attr = (name) =>
      el.hasAttribute(name) ? `${name}="${el.getAttribute(name)}"` : '(absent)'
    this.props.log = `${action} → ${attr('when')} · ${attr('tags')}`
  }

  #setPreciseDate() {
    // the time of day survives on the prop even though the attribute drops it
    this.card.props.when = new Date('2026-12-25T18:45:12Z')
    this.#report('props.when = 2026-12-25T18:45:12Z')
  }

  #setTags(tags) {
    this.card.props.tags = tags
    this.#report(`props.tags = ${JSON.stringify(tags)}`)
  }

  #writeAttribute() {
    // an outside write *is* parsed through fromAttribute
    this.card.setAttribute('tags', 'html,css,js')
    this.#report('setAttribute("tags", "html,css,js")')
  }

  get template() {
    return html`
      <event-card></event-card>

      <p class="log"><code>${this.props.log}</code></p>

      <div class="row">
        <button onclick=${() => this.#setPreciseDate()}>
          props.when = a precise Date
        </button>
        <button onclick=${() => this.#setTags(['web', 'components'])}>
          props.tags = ['web', 'components']
        </button>
        <button onclick=${() => this.#setTags([])}>
          props.tags = [] (removes the attribute)
        </button>
        <button onclick=${() => this.#writeAttribute()}>
          setAttribute("tags", "html,css,js")
        </button>
      </div>

      <p class="hint">
        Setting <code>tags</code> to an empty array makes
        <code>toAttribute</code> return <code>null</code>, which
        <strong>removes the attribute</strong> — the same mechanism that makes a
        <code>false</code> boolean an absent attribute. The last button writes
        the attribute from outside, which <em>is</em> parsed back through
        <code>fromAttribute</code> into a real array.
      </p>
    `
  }
}
customElements.define('converter-demo', ConverterDemo)
