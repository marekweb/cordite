<div align="center">
<img src="cordite.svg" width="100"/>
<h1>Cordite</h1>
</div>

Wrapper around Express designed for Create React App (CRA) front-end combiend with back-end API.

## Philosophy

You can serve a CRA front-end on its own with a plain static server, while hosting its API back-end on a separate server. That works fine and it means you end up with two separate servers with separate `package.json` files.

In this project, we take a combined approach instead: this is an Express server that serves the static front-end and also serves an API alongside it, all in one module with one single `package.json`. When you're building a project where the front-end and back-end are effectively monogamous, meaning that you don't expect the front-end to end up using different back-end APIs or the back-end to be used by different front-ends, then you

What's problem with the alternative? Some CRA tutorials suggest having one `package.json` in the root of the project for the Express server, and the a sub-directory with its own `package.json` for the CRA front-end. It's a messy solution because you have a project within a project and you have to do `npm install` and/or `npm run build` both in the root and in the sub-directory. When deploying to something like Heroku, it's best if there's a single entry point in the project and it allows the build step to be one npm command. On the other hand, the downside of the single-project approach is that to make CRA happy, we need to keep it in the root so there's no `client` directory, just a `server` directory and the client's `src` and `public` are directly in the root.

### Objective 1: Servea front-end built using CRA

To take advantage of CRA, we're going to use it as-is and follow its conventions. This objective applies to CRA front-ends **after** the `react-scripts build` command has been run, in other words when deploying in production.

CRA front-ends have just 2 parts after running the build step:

- the `index.html` page
- the `build` directory containing all the static assets (js, css, images)

First, to handle the `index.html` file: the Express server will serve the file in response to a GET request to `/`. Beyond that, to allow push-state browser routing, it will also serve `index.html` GET request on any other arbitrary path. This is done with a wildcard route, `app.get('*', ...)`. The `index.html` story would normally end there for a standalone front-end, but there's one exception: to coexist with the API feature describe in Objective #2, any route starting with `/api` will go to the API router instead.

To handle the `build` directory: the Express server uses `express.static` to serve all the files in `build`. Note that the static server will never serve a 404 if an asset doesn't exist, because the wildcard route will serve `index.html` for all other paths. It's up to the front-end router to show the equivalent of a 404.

### Objective 2: Serve an API within the same Express server as the CRA

The same Express server will serve the API with a simple convention: all routes under `/api` will be served by an API router. The API router is an Express router that can implement the API however it wants. It's a clean separation of the two concerns, and it keeps the possibility open to split it into two later.

Using the `/api` prefix allows the API router to serve 404s correctly, while the static part of the Express server (for all other routes outside of `/api`) can continue to serve `index.html` on all other requests.

### Non-objective: Server-side rendering

Server-side rendering has benefits but it makes things more complicated. The goal of Cordite is to stick to CRA in order to stay as simple and clean as possible, so SSR isn't part of the plan. The most promising solution for SSR might be [next.js](https://github.com/zeit/next.js/) as an alternative to this project, but it has its own tradeoffs.

## Features:

- `start` and `stop` methods added to `app`
- serve a directory of static assets (e.g. `build` created by CRA)
- serve a static `index.html` on a wildcard path (e.g `build/index.html` for CRA)
- serve an API router mounted at the `/api` path
- gzip compression
- security middleware by `helmet`

## To do:

- bunyan logger on the app and child logger on each request
- solve the graceful shutdown problem: when `stop` is called, first stop the server, then wait for all active requests to finish (because they might still need the database connection or other resources to complete) before resolving the `stop` promise, so that we can then know that it's safe to close the database connection. If you don't wait for those requests to finish then they might find themselves with a closed database connection before they're done using it.
