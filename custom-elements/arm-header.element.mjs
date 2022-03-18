export default class ArmHeaderElement extends HTMLElement {
	constructor() {
		super();

		// Reflect attributes to properties
		this.constructor.observedAttributes.forEach((attr) => {
			this[attr] = this.getAttribute(attr) || this.constructor[`default_${attr}`];
		});

		// const busWorkerName = this.getAttribute("bus-worker");
		// this.busWorker = window[busWorkerName];
		// this.busWorker.postMessage(new ArrayBuffer(), [new ArrayBuffer()]);
		
		this.attachShadow({ mode: "open" });
		this.shadowRoot.appendChild(this.constructor.template.content.cloneNode(true));

	}

	connectedCallback() {
		
	}

	disconnectedCallback() {

	}

	adoptedCallback() {

	}

	attributeChangedCallback(name, oldVal, newVal) {
		console.debug("attributeChangedCallback name: ", name, "oldVal: ", oldVal, "newVal: ", newVal);
		
		this[name] = newVal;
	}

	static get constant() {
		return {
			class: {
				// HIGHLIGHT: `over`,
				// INTERACTIVE: `interactive`,
			},
		};
	}

	static get observedAttributes() {
		return [
			"bus-worker",
		];
	}

	static get template() {
		const tmpl = document.createElement("template");

		tmpl.innerHTML = /* html */`
		<style type="text/css">
		:host {
			contain: content;
			display: flex;
			flex: 1 0 auto;
			align-content: space-around;
			position: relative;
			width: 100%;
			max-width: 100vw;
			height: auto;
			box-sizing: border-box;

			box-shadow: 1px 1px 3px 0 rgba(0,0,0,0.1);
			border-bottom: 1px solid #d7d7d7;
			align-self: baseline;
			padding: 10px 20px 20px;
			max-height: 1000px;
			transition: max-height, 0.2s;
			overflow: hidden;
			flex-flow: row wrap;
			justify-content: space-between;
		}
		header {
			display: flex;
			width: 100%;
			max-width: 100vw;
			box-sizing: border-box;
			flex: 1 0 auto;
			height: auto;
		}
		:host(.section--collapsed) {
			max-height: 50px;
			transition: max-height, 0.2s;
		}
		#right {
			display: flex;
			flex: 50vw;
		}
		::slotted(a), a {
			display: inline-flex;
			flex: 30vw;
			margin: 0 0 0 10px;
		}
		::slotted(h1), h1 {
			font-weight: lighter;
			color: #333;
			display: inline-flex;
			flex: 50vw;
			margin: 0;
		}
		:host(.nodisplay),
		::slotted(*.nodisplay),
		.nodisplay {
			display: none !important;
		}
		</style>
		<header>
			<slot name="title-text">
				<h1 id="titleText">Title Text</h1>
			</slot>
			<span id="right">
				<slot name="right-1">
					<a href="https://github.com/your-org/your-repo">Source</a>
				</slot>
				<slot name="right-2">
					<a href="#">About</a>
				</slot>
			</span>
		</header>
		`;

		return tmpl;
	}

	static get is() {
		return `arm-header`;
	}
}

window.customElements.define(ArmHeaderElement.is, ArmHeaderElement);
