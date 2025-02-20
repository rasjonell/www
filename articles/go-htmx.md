---
date: 2025-02-06
tags: web,go,htmx
slug: go-htmx
title: Building a Modern Website with Go, HTMX, and Templ
abstract: Let's explore how to build a modern, dynamic website using Go, HTMX, and Templ.
---

## Building a Modern Website with Go, HTMX, and Templ

In this article, we'll explore how to build a modern, dynamic website using Go, HTMX, and Templ. We will also setup Server-Sent Events(SSE) for real-time data streaming.
This stack combines the performance and simplicity of Go with the power of server-side rendering and modern frontend interactivity.

Following this guide you will end up with a website with this stack that displays real-time data:

![Screenshot 2](https://gurgen.zip/assets/go-htmx-screenshot-2.gif)


## The Stack

- Go: For when Python is too slow and Rust is too scary
- HTMX: Because 2025 is the year of hypermedia
- Templ: HTML templates that won't let you shoot yourself in the foot (much)
- Tailwind CSS: For developers who love typing class names more than writing CSS

## Project Structure

The program follows this structure:

```
server/
├── handlers/
│   └── usageSSE.go         # SSE event handler
├── view/
│   ├── components/
│   │   └── usages.templ    # System metrics components
│   ├── layout/
│   │   └── base.templ      # Base layout template
│   └── index.templ         # Main page template
├── static/
│   └── css/
│       ├── src.css         # Tailwind source
│       └── tailwind.css    # Generated styles
├── main.go                 # Server entry point
├── package.json            # Node.js dev dependencies
└── tailwind.config.js      # Tailwind configuration
```

## Setup

### 1. Project Initialization

First, let's create the project directory and initialize a Go project:

```bash
mkdir server
cd server
go mod init server
```

Install required Go dependencies:

```bash
go get github.com/a-h/templ@latest
go install github.com/a-h/templ/cmd/templ@latest
```

### 2. Tailwind CSS Setup

Initialize Node.js project and install Tailwind:

```bash
npm init -y
npm install --save-dev tailwindcss @tailwindcss/cli
```

Create `tailwind.config.js`:

```js
// server/tailwind.config.js

export default {
  content: ["./view/**/*.templ"],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Create `static/css/src.css`:

```css
// server/static/css/src.css

@import "tailwindcss"
```

Update `package.json` to add the build scripts:

```json
{
  "name": "server",
  "version": "0.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "build": "npx @tailwindcss/cli -i ./static/css/src.css -o ./static/css/tailwind.css",
    "watch": "npx @tailwindcss/cli -i ./static/css/src.css -o ./static/css/tailwind.css --watch"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "tailwindcss": "^4.0.3",
    "@tailwindcss/cli": "^4.0.3"
  }
}
```

### 3. Basic Server Setup

Create `view/layout/base.templ`:

```templ
// view/layout/base.templ
package layout

templ Base(children ...templ.Component) {
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>CEO of HTMX</title>
            <link href="/static/css/tailwind.css" rel="stylesheet"/>
        </head>
        <body class="bg-black text-green-400">
            for _, child := range children {
                @child
            }
        </body>
    </html>
}
```

Create `view/index.templ`

```templ
// view/index.templ
package view

templ Index() {
    <div class="container mx-auto px-4 py-8">
        <header class="mb-8">
            <h1 class="text-4xl font-bold text-center">System Monitor</h1>
        </header>
        <main>
            <div class="max-w-4xl mx-auto">
                Coming Soon
            </div>
        </main>
    </div>
}
```

To use these templates, first we need to generate them.
In project root, run:

```bash
templ generate
```

Create `main.go`:

```go
package main

import (
    "log"
    "net/http"
    "server/view"
    "server/view/layout"
    "github.com/a-h/templ"
)

func main() {
    // Serve static files
    fs := http.FileServer(http.Dir("./static"))
    http.Handle("/static/", http.StripPrefix("/static/", fs))

    // Serve main page with a templ component
    http.Handle("/", templ.Handler(layout.Base(view.Index())))

    log.Fatal(http.ListenAndServe(":8080", nil))
}
```

Now we have a Go server that uses Templ to generate HTML server-side and uses tailwind for styles.

To run the server, let's generate tailwind classes and start the server;

```bash
npm run build && go run main.go
```

If you navigate to `localhost:8080` you will see this page.

![Screenshot 1](https://gurgen.zip/assets/go-htmx-screenshot-1.png)


## HTMX and Real-Time Updates

Now let's add HTMX and SSE to the mix.

### 1. Adding HTMX Scripts

Update `view/layout/base.templ` to include HTMX and its SSE extension:

```html
// view/layout/base.templ
package layout

templ Base(children ...templ.Component) {
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>CEO of HTMX</title>
            <link href="/static/css/tailwind.css" rel="stylesheet"/>

            <!-- ADD THESE -->
            <script src="https://unpkg.com/htmx.org@1.9.10"></script>
            <script src="https://unpkg.com/htmx.org@1.9.12/dist/ext/sse.js"></script>
        </head>
        <body class="bg-black text-green-400">
            for _, child := range children {
                @child
            }
        </body>
    </html>
}
```

### 2. Creating Real-Time Components

Create `view/components/usages.templ`

```go
// view/components/usages.templ
package components

templ Usages() {
	<div
		hx-ext="sse"
		sse-connect="/usage"
		class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6"
	>
		<div class="bg-gray-900 p-4 border-2 border-green-400">
			<h3 class="text-2xl mb-2">CPU Usage: <span sse-swap="cpu"></span></h3>
		</div>
		<div class="bg-gray-900 p-4 border-2 border-green-400">
			<h3 class="text-2xl mb-2">Memory Usage: <span sse-swap="ram"></span></h3>
		</div>
		<div class="bg-gray-900 p-4 border-2 border-green-400">
			<h3 class="text-2xl mb-2">Disk Usage: <span sse-swap="disk"></span></h3>
		</div>
	</div>
}
```

Update `view/index.templ` to include the new `Usages` component:

```go
// view/index.templ
package view

import "server/view/components"

templ Index() {
	<div class="container mx-auto px-4 py-8">
		<header class="mb-8">
			<h1 class="text-4xl font-bold text-center">System Monitor</h1>
		</header>
		<main>
			<div class="max-w-4xl mx-auto">
                <!-- Replace "Coming Soon" with this -->
				@components.Usages()
			</div>
		</main>
	</div>
}
```

### 3. Server-Sent Events Setup

Create `handlers/usageSSE.go`:

```go
// handlers/usageSSE.go
package handlers

import (
    "fmt"
    "net/http"
    "time"
    "math/rand" // For demo purposes
)

func UsageSSE(w http.ResponseWriter, r *http.Request) {
    // Set SSE headers
    w.Header().Set("Content-Type", "text/event-stream")
    w.Header().Set("Cache-Control", "no-cache")
    w.Header().Set("Connection", "keep-alive")
    w.Header().Set("Access-Control-Allow-Origin", "*")

    for {
        select {
        case <-r.Context().Done():
            return
        default:
            // Simulated metrics (replace with real metrics)
            cpu := rand.Intn(100)
            ram := rand.Intn(100)
            disk := rand.Intn(100)

            // Send events for each metric
            fmt.Fprintf(w, "event: cpu\ndata: %d%%\n\n", cpu)
            fmt.Fprintf(w, "event: ram\ndata: %d%%\n\n", ram)
            fmt.Fprintf(w, "event: disk\ndata: %d%%\n\n", disk)

            w.(http.Flusher).Flush()
            time.Sleep(1 * time.Second)
        }
    }
}
```

### 4. Adding SSE Route

Update `main.go` to include the SSE endpoint:

```go
// main.go
package main

import (
    "log"
    "net/http"
    "server/view"
	"server/handlers"
    "server/view/layout"
    "github.com/a-h/templ"
)

func main() {
    fs := http.FileServer(http.Dir("./static"))
    http.Handle("/static/", http.StripPrefix("/static/", fs))

    // Add SSE endpoint
    http.HandleFunc("/usage", handlers.UsageSSE)
    http.Handle("/", templ.Handler(layout.Base(view.Index())))

    log.Fatal(http.ListenAndServe(":8080", nil))
}
```

Now, when you run the server and visit the page, you'll see real-time updates of system metrics without any page refreshes
or complex JavaScript. HTMX handles the SSE connection and DOM updates automatically, while Go efficiently streams the data.

```bash
templ generate && npm run build && go run main.go
```

![Screenshot 2](https://gurgen.zip/assets/go-htmx-screenshot-2.gif)

## Extras

Now, this is all cool and stuff, but in my current workflow I use some additions for this setup.

### 1. `air` Live Reload Server

Running `templ generate && npm run build && go run main.go` is tiring and not something you should do after every single change.

To fix that let's install and configure [air](https://github.com/air-verse/air) to handle that for us:

```bash
go install github.com/air-verse/air@latest
```

Create an `.air.toml` file with this config:

```
# file: server/.air.toml

root = "."
tmp_dir = "bin"

[build]
  bin = "./bin/main"
  cmd = "templ generate && npm run build && go build main.go -o ./bin/main ."
  delay = 500
  exclude_dir = ["static", "node_modules"]
  exclude_regex = [".*_templ.go"]
  exclude_unchanged = false
  follow_symlink = false
  include_ext = ["go", "tpl", "tmpl", "templ", "html"]
  kill_delay = "0s"
  log = "build-errors.log"
  send_interrupt = false
  stop_on_error = true

[color]
  build = "yellow"
  main = "magenta"
  runner = "green"
  watcher = "cyan"

[log]
  time = false

[misc]
  clean_on_exit = true

[screen]
  clear_on_rebuild = true
  keep_scroll = true

# Enable live-reloading on the browser.
[proxy]
  enabled = true
  app_port = 8080
  proxy_port = 8090

```

Now in the server directory you can run `air` and it will setup a live-reload server alongside with a proxy listening on `localhost:8090`
that will automatically detect changes in your server and run the build commands and reload the proxied server.


### 2. Sending Partial HTMLs

When using HTMX we need to be able send some parts as html.

#### 2.1 `templ.Handler`

We have already seen the `templ.Handler()` function from the `a-h/templ` library.
It receives a `templ.Component` and returns an `http.Handler` interface so you can use it to handle various requests:

Let's say we have an html element that uses `hx-get` to swap itself with the server response:

```html
<button hx-get="/foo" hx-swap="outerHTML" class="btn bg-teal-200 p-4 rounded-lg cursor-pointer">
    Foo
</button>

```

We can define a `templ` component `Bar`:

```go
package partials

templ Bar() {
    <div>
        You Clicked on Foo
    </div>
}
```

And then handle this interaction in our router:

```go
http.Handle("/foo", templ.Handler(partials.Bar()))
```


#### 2.2 Rendering Comonents to strings

We sometimes may need to use just the string content of the final `templ` component.
For example you want to send a new partial html as a part of your Server-Sent Event

The SSE has the following structure:

```
event: event-name
data: any-data
```

Now, to replace the `data` in the msg with a partial component, we need to turn it into a string and interpolate it.
`templ.Component` has a `Render(ctx context.Context, w io.Writer)` Method, so we can just:

```go
var buf strings.Builder
_ = partials.Bar().Render(context.Background(), &buf)

sseMsg := fmt.Sprintf("event: %s\ndata: %s\n\n", "event-name", buf.String())
```

the `sseMsg` now has the partial component embedded in its `data` field.


## References

Check out [hybr](https://github.com/rasjonell/hybr). Where I use this stack to build a self-hosted service management platform.

- [htmx](https://htmx.org/)
- [htmx-sse](https://v1.htmx.org/extensions/server-sent-events/)
- [templ](https://github.com/a-h/templ)
- [air](https://github.com/air-verse/air)
