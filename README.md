# @centrix/forge-sdk

TypeScript SDK for the [Forge](https://github.com/centrixsystems/forge) rendering engine. Converts HTML/CSS to PDF, PNG, and other formats via a running Forge server.

Uses native `fetch` — works in Node.js 18+, Deno, Bun, and browsers. Zero runtime dependencies.

## Installation

```sh
npm install @centrix/forge-sdk
```

## Quick Start

```typescript
import { ForgeClient } from "@centrix/forge-sdk";
import { writeFile } from "node:fs/promises";

const client = new ForgeClient("http://localhost:3000");

const pdf = await client.renderHtml("<h1>Invoice #1234</h1>")
  .format("pdf")
  .paper("a4")
  .send();

await writeFile("invoice.pdf", pdf);
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
  .density(2.0)
  .send();
```

### Color Quantization

Reduce colors for e-ink displays or limited-palette output.

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
  timeout: 300_000, // 5 minutes in milliseconds
});
```

### Health Check

```typescript
const healthy = await client.health();
```

## API Reference

### `ForgeClient`

```typescript
new ForgeClient(baseUrl: string, options?: ForgeClientOptions)
```

| Method | Returns | Description |
|--------|---------|-------------|
| `renderHtml(html)` | `RenderRequestBuilder` | Start a render request from an HTML string |
| `renderUrl(url)` | `RenderRequestBuilder` | Start a render request from a URL |
| `health()` | `Promise<boolean>` | Check server health |

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `timeout` | `number` | `120000` | HTTP request timeout in milliseconds |

### `RenderRequestBuilder`

All methods return `this` for chaining. Call `.send()` to execute.

| Method | Type | Description |
|--------|------|-------------|
| `format` | `OutputFormat` | Output format (default: `"pdf"`) |
| `width` | `number` | Viewport width in CSS pixels |
| `height` | `number` | Viewport height in CSS pixels |
| `paper` | `string` | Paper size: a3, a4, a5, b4, b5, letter, legal, ledger |
| `orientation` | `Orientation` | `"portrait"` or `"landscape"` |
| `margins` | `string` | Preset (`default`, `none`, `narrow`) or `"T,R,B,L"` in mm |
| `flow` | `Flow` | `"auto"`, `"paginate"`, or `"continuous"` |
| `density` | `number` | Output DPI (default: 96) |
| `background` | `string` | CSS background color (e.g. `"#ffffff"`) |
| `timeout` | `number` | Page load timeout in seconds |
| `colors` | `number` | Quantization color count (2-256) |
| `palette` | `Palette` | Preset string or array of hex color strings |
| `dither` | `DitherMethod` | Dithering algorithm |

| Terminal Method | Returns | Description |
|-----------------|---------|-------------|
| `send()` | `Promise<Uint8Array>` | Execute the render request |

### Types

```typescript
type OutputFormat = "pdf" | "png" | "jpeg" | "bmp" | "tga" | "qoi" | "svg";
type Orientation = "portrait" | "landscape";
type Flow = "auto" | "paginate" | "continuous";
type DitherMethod = "none" | "floyd-steinberg" | "atkinson" | "ordered";
type PalettePreset = "auto" | "bw" | "grayscale" | "eink";
type Palette = PalettePreset | string[];
```

### Errors

| Error | Properties | Description |
|-------|------------|-------------|
| `ForgeError` | `message` | Base error class for all SDK errors |
| `ForgeServerError` | `status: number` | Server returned 4xx/5xx with error message |
| `ForgeConnectionError` | `cause: unknown` | Network failure (DNS, timeout, connection refused) |

## Requirements

- Node.js 18+ / Deno / Bun (any runtime with global `fetch`)
- A running [Forge](https://github.com/centrixsystems/forge) server

## License

MIT
