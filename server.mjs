// #!/usr/bin/env node

import {
	createServer,
	STATUS_CODES,
} from "http";
import { get, request } from "https";
import {
	createReadStream,
	readFileSync,
} from "fs";
import {
	resolve,
	extname,
	join,
	dirname,
} from "path";

import log from "electron-log";

// Because modules don't have __dirname injected
const __dirname = dirname(new URL(import.meta.url).pathname);

log.transports.file.resolvePath = () => join(__dirname, 'logs/server.log');

const mimeTypes = {
	".html": "text/html",
	".htm": "text/html",
	".jpeg": "image/jpeg",
	".jpg": "image/jpeg",
	".png": "image/png",
	".js": "application/javascript",
	".mjs": "application/javascript",
	".cjs": "application/javascript",
	".css": "text/css",
	".ico": "image/vnd",
	".map": "application/octet-stream",
	".svg": "image/svg+xml",
	".ttf": "font/ttf",
	".woff": "font/woff",
	".webmanifest": "application/manifest+json",
};

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const { defaultConfig } = JSON.parse(readFileSync(`${__dirname}/package.json`));
const config = {
	...defaultConfig,
	...process.env,
	routes: {
		"/gm": "https://google.com",
		...defaultConfig.routes,
	}
};

const httpServer = createServer(requestHandler)
	.listen(config.TEST_SERVER_PORT, config.TEST_SERVER_ADDR, listeningHandler)
	.on("error", (err) => {
		log.error("Caught error", err);
	});

export default {
	httpServer,
	port: config.TEST_SERVER_PORT,
};

process.on(`SIGTERM`, shutdown);
process.on(`SIGINT`, shutdown);
process.on(`uncaughtException`, shutdown);

function requestHandler(req, res) {
	log.info(`~requestHandler `, req.url);

	if (req.url.startsWith("/api")) {
		return apiRequestHandler(req, res);
	} else {
		return staticRequestHandler(req, res);
	}
}

function apiRequestHandler(req, res) {
	const requestPath = req.url
		.replace(/\/{2,}/g, "/")
		.replace("/api", "");

	log.info("requestPath???", requestPath);

	const url = config.routes[requestPath];
	
	log.info("proxying request to ", url);

	return void get(url, (proxiedResponse) => {
		let data = ``;
		
		proxiedResponse.on("data", (d) => {
			data += d;
		});
		
		return proxiedResponse.pipe(res);
	})
	.on("error", handleApiRequestError);

	function handleApiRequestError(error) {
		log.error("#handleApiRequestError", error);
		res.writeHead(500, { "content-type": "application/json" });
		res.write(error.toString());
		res.end();
	}
}


function staticRequestHandler(req, res) {
	if (req.url === "/" || req.url.startsWith("/index.htm")) {
		log.info("Serve index");
		// send index.html
		res.writeHead(200, { "content-type": "text/html" });

		createReadStream(resolve(__dirname, "index.html"))
			.on("error", requestErrorHandler)
			.pipe(res);
	} else {
		log.info("Serve other file");

		const path = req.url.replace(/^\//, "");
		const extension = extname(req.url);
		log.info("extension???", extension);

		res.writeHead(200, { "content-type": mimeTypes[extension] });

		if (req.url.endsWith("favicon.ico")) {
			// favicon
			return res.end();
		}

		createReadStream(resolve(`${__dirname}/${path}`))
			.on("error", requestErrorHandler)
			.pipe(res);
	}

	function requestErrorHandler (err) {
		log.error("Caught error handling request", err);
		if (err.code === "ENOENT") {
			res
				.writeHead(404)
				.end(STATUS_CODES["404"]);
		} else {
			res
				.writeHead(500)
				.end(STATUS_CODES["500"] + ":" + err.message);
		}
	}
}

function listeningHandler () {
	log.info(`Server listening ${config.TEST_SERVER_ADDR}:${config.TEST_SERVER_PORT}`);
}

function shutdown (...args) {
	httpServer.close();

	if (args[1] === "uncaughtException") {
		log.error(args[0]);
		// process.exit(1);
	} else {
		log.info(args[0]);
		// process.exit(0);
	}
}