#!/usr/bin/env node
const fs = require("fs");
const http = require("http");
const path = require("path");

const file = path.resolve(process.argv[2] || "");
if (!file || !fs.existsSync(file)) {
  console.error("Usage: serve-html.js <review.html> [--port 8766] [--route /review]");
  process.exit(2);
}

function argValue(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const port = Number(argValue("--port", "8766"));
const defaultRoute = `/${path.basename(file).replace(/\.html$/, "")}`;
const route = argValue("--route", defaultRoute);

const server = http.createServer((req, res) => {
  if (req.url !== "/" && req.url !== route) {
    res.writeHead(302, { Location: route });
    res.end();
    return;
  }

  try {
    const html = fs.readFileSync(file, "utf8");
    res.writeHead(200, {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    });
    res.end(html);
  } catch (error) {
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end(error.stack || String(error));
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`HTML PR review canvas: http://127.0.0.1:${port}${route}`);
});
