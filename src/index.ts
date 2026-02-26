export { ForgeError, ForgeServerError, ForgeConnectionError } from "./error.js";
export type {
  OutputFormat,
  Orientation,
  Flow,
  DitherMethod,
  Palette,
  PalettePreset,
} from "./types.js";

import { ForgeConnectionError, ForgeServerError } from "./error.js";
import type {
  DitherMethod,
  ErrorResponse,
  Flow,
  Orientation,
  OutputFormat,
  Palette,
  RenderPayload,
} from "./types.js";

/** Options for creating a ForgeClient. */
export interface ForgeClientOptions {
  /** HTTP request timeout in milliseconds (default: 120000). */
  timeout?: number;
}

/** Client for a Forge rendering server. */
export class ForgeClient {
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(baseUrl: string, options?: ForgeClientOptions) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.timeout = options?.timeout ?? 120_000;
  }

  /** Start a render request from an HTML string. */
  renderHtml(html: string): RenderRequestBuilder {
    return new RenderRequestBuilder(this, { html });
  }

  /** Start a render request from a URL. */
  renderUrl(url: string): RenderRequestBuilder {
    return new RenderRequestBuilder(this, { url });
  }

  /** Check if the server is healthy. */
  async health(): Promise<boolean> {
    try {
      const resp = await this.fetch("/health", { method: "GET" });
      return resp.ok;
    } catch {
      return false;
    }
  }

  /** @internal */
  async fetch(path: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);
    try {
      return await fetch(`${this.baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  }
}

/** Builder for a render request. */
export class RenderRequestBuilder {
  private readonly client: ForgeClient;
  private readonly html?: string;
  private readonly url?: string;
  private fmt: OutputFormat = "pdf";
  private w?: number;
  private h?: number;
  private pap?: string;
  private orient?: Orientation;
  private marg?: string;
  private fl?: Flow;
  private dens?: number;
  private bg?: string;
  private tout?: number;
  private col?: number;
  private pal?: Palette;
  private dit?: DitherMethod;

  /** @internal */
  constructor(
    client: ForgeClient,
    source: { html?: string; url?: string },
  ) {
    this.client = client;
    this.html = source.html;
    this.url = source.url;
  }

  /** Output format (default: "pdf"). */
  format(fmt: OutputFormat): this {
    this.fmt = fmt;
    return this;
  }

  /** Viewport width in CSS pixels. */
  width(px: number): this {
    this.w = px;
    return this;
  }

  /** Viewport height in CSS pixels. */
  height(px: number): this {
    this.h = px;
    return this;
  }

  /** Paper size: a3, a4, a5, b4, b5, letter, legal, ledger. */
  paper(size: string): this {
    this.pap = size;
    return this;
  }

  /** Page orientation. */
  orientation(o: Orientation): this {
    this.orient = o;
    return this;
  }

  /** Margins preset or "T,R,B,L" in mm. */
  margins(m: string): this {
    this.marg = m;
    return this;
  }

  /** Document flow mode. */
  flow(f: Flow): this {
    this.fl = f;
    return this;
  }

  /** Output DPI (default: 96). */
  density(dpi: number): this {
    this.dens = dpi;
    return this;
  }

  /** Background CSS color. */
  background(color: string): this {
    this.bg = color;
    return this;
  }

  /** Page load timeout in seconds. */
  timeout(seconds: number): this {
    this.tout = seconds;
    return this;
  }

  /** Number of colors for quantization (2-256). */
  colors(n: number): this {
    this.col = n;
    return this;
  }

  /** Color palette preset or custom hex colors. */
  palette(p: Palette): this {
    this.pal = p;
    return this;
  }

  /** Dithering algorithm. */
  dither(method: DitherMethod): this {
    this.dit = method;
    return this;
  }

  /** Build the JSON payload. @internal */
  buildPayload(): RenderPayload {
    const payload: RenderPayload = { format: this.fmt };

    if (this.html !== undefined) payload.html = this.html;
    if (this.url !== undefined) payload.url = this.url;
    if (this.w !== undefined) payload.width = this.w;
    if (this.h !== undefined) payload.height = this.h;
    if (this.pap !== undefined) payload.paper = this.pap;
    if (this.orient !== undefined) payload.orientation = this.orient;
    if (this.marg !== undefined) payload.margins = this.marg;
    if (this.fl !== undefined) payload.flow = this.fl;
    if (this.dens !== undefined) payload.density = this.dens;
    if (this.bg !== undefined) payload.background = this.bg;
    if (this.tout !== undefined) payload.timeout = this.tout;

    if (this.col !== undefined || this.pal !== undefined || this.dit !== undefined) {
      const q: NonNullable<RenderPayload["quantize"]> = {};
      if (this.col !== undefined) q.colors = this.col;
      if (this.pal !== undefined) q.palette = this.pal;
      if (this.dit !== undefined) q.dither = this.dit;
      payload.quantize = q;
    }

    return payload;
  }

  /** Send the render request and return raw output bytes. */
  async send(): Promise<Uint8Array> {
    const payload = this.buildPayload();

    let resp: Response;
    try {
      resp = await this.client.fetch("/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      throw new ForgeConnectionError(e);
    }

    if (!resp.ok) {
      let message: string;
      try {
        const body = (await resp.json()) as ErrorResponse;
        message = body.error;
      } catch {
        message = `HTTP ${resp.status}`;
      }
      throw new ForgeServerError(resp.status, message);
    }

    const buf = await resp.arrayBuffer();
    return new Uint8Array(buf);
  }
}
