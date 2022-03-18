export default class ArmRouterElement extends HTMLElement {
	/**
	 * Instantiate ArmRouter HTMLElement
	 * @return {ArmRouterElement}
	 *
	 * Considering a JSDOC style test suite. It seems OK in that the tests are 
	 * closer to the code itself, but it still seems like it's too separate, and
	 * thus optional. Integrating the code with the tests seems preferable.
	 * Integrate tests with code? Or integrate tests with documentation?
	 * Because JSDOC tests could arguably be used as documentation.
	 * But, then again, if written correctly, a code-integrated test mechanism
	 * could generate documentation similar to JSDOC, but without being separate
	 * from the code itself. This seems ideal.
	 * 
	 * @test Should return an instance of ArmRouterElement
	 *
	 * @test Should be an HTMLElement
	 *
	 * @test Should have a single, unnamed slot
	 *
	 * @test Should reflect attributes to properties
	 *
	 * @test Should check each slotted route for invalid ID
	 *
	 * @test Should hide all pages other than the current hash
	 *
	 * @test should default to home route if current page not found
	 *
	 * @test Should set window.location.hash if no initial hash
	 * 
	 */
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

		// this.shadowRoot.getElementById("fileInput").addEventListener("change", this.fileAddHandler.bind(this));
		
		// Basically single page router module
		// init
		this.startingHashSlashRegExp = /^(#\/)?/;
		const pages = Array.from(document.querySelectorAll(`.router-page`));
		const initialPage = `page_${window.location.hash.replace(this.startingHashSlashRegExp, "")}`;

		pages.forEach(({ id }) => {
			const isInvalidUrl = /[^a-zA-Z0-9-_]/g.test(id);

			const errorMsg = `${id} contains invalid characters. Slotted route IDs must not contain characters other than [A-z0-9-_]`;
			console.assert(isInvalidUrl !== true, { id, errorMsg });
		});

		pages
			.filter(el => el.id !== initialPage)
			.forEach(el => void el.classList.add("nodisplay"));

		if (!document.querySelector(`#${initialPage}`)) {
			window.location.hash = this.homePage;
		}

		if (!window.location.hash) {
			window.location.hash = this.homePage;
		}	
	}

	connectedCallback() {
		window.addEventListener("hashchange", this.windowHashChanged.bind(this), false);
		this.selectAnchor(window.location.hash.replace(this.startingHashSlashRegExp, ""));
	}

	disconnectedCallback() {
		window.removeEventListener("hashchange", this.windowHashChanged.bind(this), false);
	}

	adoptedCallback() {

	}

	attributeChangedCallback(name, oldVal, newVal) {
		console.debug("attributeChangedCallback name: ", name, "oldVal: ", oldVal, "newVal: ", newVal);
		const attrMap = {
			"home": "homePage",
		};
		
		if (attrMap[name]) {
			const instanceAttrName = attrMap[name];
			this[instanceAttrName] = newVal;
		}
	}

	// addListeners(methodName, eventName) {
	// 	this[methodName]();
	// }

	preventDefaults(event) {
		event.stopPropagation();
		event.preventDefault();
	}

	windowHashChanged(event) {
		this.changePage(event.oldURL, event.newURL);
	}

	changePage(oldUrl, newUrl) {
		// Hide previously displayed page
		const oldPageId = this.getHash(oldUrl);
		this.hidePage(oldPageId);
		this.unselectAnchor(oldPageId);

		// Show relevant content
		const newPageId = this.getHash(newUrl);
		this.showPage(newPageId);
		this.selectAnchor(newPageId);
	}

	unselectAnchor(id) {
		const aEl = document.querySelector(`#anchor_${id}`);
		if (!aEl) return;

		return void aEl.classList.remove("page--current");
	}

	selectAnchor(id) {
		const aEl = document.querySelector(`#anchor_${id}`);
		if (!aEl) return;

		return void aEl.classList.add("page--current");
	}

	hidePage(id) {
		const pageEl = document.querySelector(`#page_${id}`);
		if (!pageEl) return;

		return void pageEl.classList.add("nodisplay");
	}

	showPage(id) {
		const pageEl = document
			.querySelector(`#page_${id}`);

		if (!pageEl) {
			console.info("@ArmRouter#showPage pageEl not found so change window.location.hash to this.homePage");
			window.location.hash = this.homePage;
			return;
		}

		return void pageEl.classList.remove("nodisplay");
	}

	getHash(url) {
		const hash = new URL(url).hash;
		return hash.replace(this.startingHashSlashRegExp, "");
	}

	static get observedAttributes() {
		return [
			"home",
		];
	}

	static get constant() {
		return {
			class: {
				// HIGHLIGHT: `over`,
				// INTERACTIVE: `interactive`,
			},
		};
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
		}
		.nodisplay {
			display: none !important;
		}
		</style>
		<slot>
			<section id="page_home" class="content router-page">
				Default route. add sections (routes) here to slot
			</section>
		</slot>
		`;

		return tmpl;
	}

	static get is() {
		return `arm-router`;
	}
}

window.customElements.define(ArmRouterElement.is, ArmRouterElement);
