#!/usr/bin/env node

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
} from "path";

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

// Because modules don't have __dirname injected
// const __dirname = dirname(new URL(import.meta.url).pathname);

const { defaultConfig } = JSON.parse(readFileSync(`./package.json`));
const config = {
	...defaultConfig,
	...process.env,
};

const httpServer = createServer(requestHandler)
	.listen(config.TEST_SERVER_PORT, config.TEST_SERVER_ADDR, listeningHandler)
	.on("error", (err) => {
		console.error("Caught error", err);
	});

process.on(`SIGTERM`, shutdown);
process.on(`SIGINT`, shutdown);
process.on(`uncaughtException`, shutdown);

function requestHandler (req, res) {
	console.info(`~requestHandler `, req.url);

	if (req.url.startsWith("/api")) {
		return apiRequestHandler(req);
	} else {
		return staticRequesthandler(req);
	}
}

function apiRequestHandler(req) {
	const url = "https://gm.api.whatever.ok.exe?yes";

	req
		.pipe(request(url))
		.pipe(res);

	function handleApiRequestError(error) {
		console.error("#handleApiRequestError", error);
	}
}


function staticRequestHandler(req) {
	if (req.url === "/" || req.url.startsWith("/index.htm")) {
		console.info("Serve index");
		// send index.html
		res.writeHead(200, { "content-type": "text/html" });

		createReadStream(resolve("./", "index.html"))
			.on("error", requestErrorHandler)
			.pipe(res);
	} else {
		console.info("Serve other file");

		const path = req.url.replace(/^\//, "");
		const extension = extname(req.url);
		console.log("extension???", extension);

		res.writeHead(200, { "content-type": mimeTypes[extension] });

		if (req.url.endsWith("favicon.ico")) {
			// favicon
			return res.end();
		}

		createReadStream(resolve(path))
			.on("error", requestErrorHandler)
			.pipe(res);
	}

	function requestErrorHandler (err) {
		console.error("Caught error handling request", err);
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
	console.info(`Server listening ${config.TEST_SERVER_ADDR}:${config.TEST_SERVER_PORT}`);
}

function shutdown (...args) {
	httpServer.close();

	if (args[1] === "uncaughtException") {
		console.error(args[0]);
		process.exit(1);
	} else {
		console.info(args[0]);
		process.exit(0);
	}
}