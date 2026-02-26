# @centrix/forge-sdk

TypeScript SDK for the [Forge](https://github.com/centrixsystems/forge) rendering engine. Converts HTML/CSS to PDF, PNG, and other formats via a running Forge server.

Uses native `fetch` — works in Node.js 18+, Deno, Bun, and browsers.

## Installation

```sh
npm install @centrix/forge-sdk
```

## Quick Start

```typescript
import { ForgeClient } from "@centrix/forge-sdk";

const client = new ForgeClient("http://localhost:3000");

const pdf = await client.renderHtml("<h1>Invoice #1234</h1>")
  .format("pdf")
  .paper("a4")
  .send();

await Bun.write("invoice.pdf", pdf);
// or in Node.js:
// import { writeFile } from "node:fs/promises";
// await writeFile("invoice.pdf", pdf);
```

## Usage

### Render HTML to PDF

```typescript
const pdf = await client.renderHtml("<h1>Hello</h1>")
  .format("pdf")
  .paper("a4")
  .orientation("portrait")
  .margins("25.4,25.4,25.4,25.4")
  .flow("paginate")
  .send();
```

### Render URL to PNG

```typescript
const png = await client.renderUrl("https://example.com")
  .format("png")
  .width(1280)
  .height(800)
  .send();
```

### Color Quantization

```typescript
const eink = await client.renderHtml("<h1>Dashboard</h1>")
  .format("png")
  .palette("eink")
  .dither("floyd-steinberg")
  .send();
```

### Custom Palette

```typescript
const img = await client.renderHtml("<h1>Brand</h1>")
  .format("png")
  .palette(["#000000", "#ffffff", "#ff0000"])
  .dither("atkinson")
  .send();
```

### Custom Timeout

```typescript
const client = new ForgeClient("http://forge:3000", {
  timeout: 120_000, // ms
});
```

### Health Check

```typescript
const healthy = await client.health();
```

## API Reference

### `ForgeClient`

| Method | Description |
|--------|-------------|
| `new ForgeClient(baseUrl, options?)` | Create a client |
| `renderHtml(html)` | Start a render request from an HTML string |
| `renderUrl(url)` | Start a render request from a URL |
| `health()` | Check server health |

### `RenderRequestBuilder`

All methods return `this` for chaining. Call `.send()` to execute.

| Method | Type | Description |
|--------|------|-------------|
| `format` | `OutputFormat` | Output format (default: "pdf") |
| `width` | `number` | Viewport width in CSS pixels |
| `height` | `number` | Viewport height in CSS pixels |
| `paper` | `string` | Paper size: a3, a4, a5, b4, b5, letter, legal, ledger |
| `orientation` | `Orientation` | "portrait" or "landscape" |
| `margins` | `string` | Preset (default, none, narrow) or "T,R,B,L" in mm |
| `flow` | `Flow` | "auto", "paginate", or "continuous" |
| `density` | `number` | Output DPI (default: 96) |
| `background` | `string` | CSS background color |
| `timeout` | `number` | Page load timeout in seconds |
| `colors` | `number` | Quantization color count (2-256) |
| `palette` | `Palette` | Preset string or array of hex colors |
| `dither` | `DitherMethod` | Dithering algorithm |

### Types

```typescript
type OutputFormat = "pdf" | "png" | "jpeg" | "bmp" | "tga" | "qoi" | "svg";
type Orientation = "portrait" | "landscape";
type Flow = "auto" | "paginate" | "continuous";
type DitherMethod = "none" | "floyd-steinberg" | "atkinson" | "ordered";
type Palette = "auto" | "bw" | "grayscale" | "eink" | string[];
```

### Errors

- **`ForgeError`** — base error class
- **`ForgeServerError`** — 4xx/5xx server responses (has `.status`)
- **`ForgeConnectionError`** — network/connection failures

## License

MIT
