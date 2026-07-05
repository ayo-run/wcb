import { html, WebComponent } from 'web-component-base'

/**
 * TODO: rendering currently wipes all children so focus gets removed on fields
 */
export class ObjectText extends WebComponent {
  static props = {
    object: {
      hello: 'worldzz',
      age: 2,
    },
  }
  onChanges() {
    console.log('>>> object', this.props.object)
  }
  get template() {
    return html`
      <form>
        <label for="greeting-field">Hello</label>
        <textarea
          onkeyup=${(event) => {
            this.props.object = {
              ...this.props.object,
              hello: event.target.value,
            }
          }}
          id="greeting-field"
        >
            ${this.props.object.hello}
        </textarea
        >
        <label for="age-field">Age</label>
        <input
          onkeyup=${(event) => {
            this.props.object = {
              ...this.props.object,
              age: event.target.value,
            }
          }}
          id="age-field"
          value=${this.props.object.age}
        />
      </form>
    `
  }
}

customElements.define('my-object', ObjectText)
