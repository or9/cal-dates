export default class ArmFooterElement extends HTMLElement {
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
		this.shadowRoot
			.getElementById("footerCopyright")
			.innerHTML = `©${new Date().getFullYear()} by ${this.getAttribute("copyright-name")}`;
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
			"copyright-name",
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
			position: relative;
			width: 100%;
			max-width: 100vw;
			height: auto;
			flex: 1 0 auto;
			box-sizing: border-box;
			align-self: stretch;
			border-top: 1px solid #d7d7d7;
			padding: 20px 20px 100px;
			flex-shrink: 0;
			background: #333;
			color: #fff;
			font-size: 0.9em;
			line-height: 1em;
		}
		footer {
			width: 100%;
			display: flex;
		}
		#footerCopyright {
			flex: 10 1 auto;
		}
		#footerVersions {
			align-self: flex-end;
			text-align: right;
			flex: 1 10 auto;
		}
		.nodisplay {
			display: none !important;
		}
		</style>
		<footer>
			<slot name="copyright">
				<span id="footerCopyright"><!-- this content will be populated by JS --></span>
			</slot>
			<slot name="versions">
				<span id="footerVersions">
					Node <code id="node-version">N/A</code> | 
					Chrome <code id="chrome-version">N/A</code> | 
					Electron <code id="electron-version">N/A</code> | 
					App <code id="app-version">N/A</code> 
				</span>
			</slot>
		</footer>
		`;

		return tmpl;
	}

	static get is() {
		return `arm-footer`;
	}
}

window.customElements.define(ArmFooterElement.is, ArmFooterElement);
