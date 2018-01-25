<div align="center">
<img src="cordite.svg" width="100"/>
<h1>Cordite</h1>
</div>

Wrapper around Express designed for Create React App (CRA) front-end combiend with back-end API.

## Features:

- `start` and `stop` methods added to `app`
- serve a directory of static assets (e.g. `build` created by CRA)
- serve a static `index.html` on a wildcard path (e.g `build/index.html` for CRA)
- serve an API router mounted at the `/api` path
- gzip compression
- security middleware by `helmet`
