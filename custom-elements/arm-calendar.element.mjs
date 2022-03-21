export default class ArmCalendarElement extends HTMLElement {
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
		
		this.constructor.createFullCalendarScriptElement()
			.then(() => {
				const calendarEl = this.shadowRoot.getElementById("calendar");
				this.calendar = new FullCalendar.Calendar(calendarEl, this.constructor.defaultCalendarOptions);
			})
			.catch((err) => {
				console.error("Error instantiating calendar");
			});
	}

	get calendarOptions() {
		return this.constructor.observedAttributes.reduce((current, next) => {
			current[next] = this.getAttribute(next);

			return current;
		}, {});
	}

	static get attributeMap() {
		return {

		};
	}

	static createFullCalendarScriptElement() {
		return new Promise(loadScriptEl);

		function loadScriptEl(resolve, reject) {
			// Only load fullcalendar script once
			if (document.getElementById("fullcalendar")) return;

			// If fullcalendar main script doesn't exist, create it
			const scriptEl = document.createElement("script");
			scriptEl.src = "/node_modules/fullcalendar/main.js";
			scriptEl.id = "fullcalendar";
			scriptEl.onload = resolve;
			scriptEl.onerror = reject;

			document.head.appendChild(scriptEl);
		}
	}

	connectedCallback() {
		renderCalendar.call(this, 0);

		function renderCalendar(tryNum) {
			if (!!this.calendar) {
				this.calendar.render();
			} else {
				const tryTimeout = (tryNum + 1) * 10;
				setTimeout(renderCalendar.bind(this, tryTimeout), tryTimeout);
			}
		}
	}

	disconnectedCallback() {
		this.calendar.destroy();
	}

	adoptedCallback() {

	}

	attributeChangedCallback(name, oldVal, newVal) {
		console.debug("attributeChangedCallback name: ", name, "oldVal: ", oldVal, "newVal: ", newVal);
		
		this[name] = newVal;
	}

	static get defaultCalendarOptions() {
		return {
			initialView: "dayGridMonth",
			headerToolbar: {
				start: "title",
				center: "dayGridMonth,timeGrid,timeGridWeek",
				end: "today prev,next",
			},
			stickyHeaderDates: true,
			views: {
				dayGridMonth: {
					titleFormat: {
						year: "numeric",
						month: "long",
					},
					fixedWeekCount: 1,
					showNonCurrentDates: true,
				},
				dayGrid: {
					titleFormat: {
						year: "numeric",
						month: "short",
						day: "numeric",
					},
				},
				timeGrid: {
					titleFormat: {
						year: "numeric",
						month: "short",
						day: "numeric",
					},
					nowIndicator: true,
					scrollTime: Date.now(),
				},
				timeGridWeek: {
					titleFormat: {
						year: "numeric",
						month: "short",
						day: "numeric",
					},
					nowIndicator: true,
					scrollTime: Date.now(),
				},
				day: {
					titleFormat: {
						year: "numeric",
						month: "short",
						day: "numeric",
					},
				},
			}
			// ...this.calendarOptions,
		};
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
			"calendar-data",
			"calendar-view",
			// height
			// contentHeight
			// aspectRatio
			// expandRows
			// updateSize
			// handleWindowResize
			// windowResizeDelay
			// stickyHeaderDates
			// stickyFooterScrollbar
		];
	}

	static get template() {
		const tmpl = document.createElement("template");

		tmpl.innerHTML = /* html */`
		<link href='/node_modules/fullcalendar/main.css' rel='stylesheet' />
		<style>
		.fc {
			font-size: 0.85em;
		}
		.fc h2 {
			font-weight: lighter;
		}
		.fc .fc-button {
			font-weight: lighter;
		}
		.fc table {
			font-size: 1em;
		}
		.fc table thead th {
			font-weight: lighter;
		}
		</style>
		<div id="calendar"></div>
		`;

		return tmpl;
	}

	static get is() {
		return `arm-calendar`;
	}
}

window.customElements.define(ArmCalendarElement.is, ArmCalendarElement);
