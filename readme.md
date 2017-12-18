# Express for CRA and API

This is a wrapper around Express.

Features:

- `start` and `stop` methods added to `app`
- serve a directory of static assets (e.g. `build` created by CRA)
- serve a static `index.html` on a wildcard path (e.g `build/index.html` for CRA)
- serve an API router mounted at the `/api` path
- gzip compression
- security middleware by `helmet`

To do:

- bunyan logger on the app and child logger on each request
