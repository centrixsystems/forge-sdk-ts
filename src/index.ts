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
      const resp = await this.doFetch("/health", { method: "GET" });
      return resp.ok;
    } catch {
      return false;
    }
  }

  /** @internal — not part of the public API. */
  async doFetch(path: string, init: RequestInit): Promise<Response> {
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
  private readonly _html?: string;
  private readonly _url?: string;
  private _format: OutputFormat = "pdf";
  private _width?: number;
  private _height?: number;
  private _paper?: string;
  private _orientation?: Orientation;
  private _margins?: string;
  private _flow?: Flow;
  private _density?: number;
  private _background?: string;
  private _timeout?: number;
  private _colors?: number;
  private _palette?: Palette;
  private _dither?: DitherMethod;
  private _pdfTitle?: string;
  private _pdfAuthor?: string;
  private _pdfSubject?: string;
  private _pdfKeywords?: string;
  private _pdfCreator?: string;
  private _pdfBookmarks?: boolean;

  /** @internal */
  constructor(
    client: ForgeClient,
    source: { html?: string; url?: string },
  ) {
    this.client = client;
    this._html = source.html;
    this._url = source.url;
  }

  /** Output format (default: "pdf"). */
  format(format: OutputFormat): this {
    this._format = format;
    return this;
  }

  /** Viewport width in CSS pixels. */
  width(px: number): this {
    this._width = px;
    return this;
  }

  /** Viewport height in CSS pixels. */
  height(px: number): this {
    this._height = px;
    return this;
  }

  /** Paper size: a3, a4, a5, b4, b5, letter, legal, ledger. */
  paper(size: string): this {
    this._paper = size;
    return this;
  }

  /** Page orientation. */
  orientation(o: Orientation): this {
    this._orientation = o;
    return this;
  }

  /** Margins preset or "T,R,B,L" in mm. */
  margins(m: string): this {
    this._margins = m;
    return this;
  }

  /** Document flow mode. */
  flow(f: Flow): this {
    this._flow = f;
    return this;
  }

  /** Output DPI (default: 96). */
  density(dpi: number): this {
    this._density = dpi;
    return this;
  }

  /** Background CSS color. */
  background(color: string): this {
    this._background = color;
    return this;
  }

  /** Page load timeout in seconds. */
  timeout(seconds: number): this {
    this._timeout = seconds;
    return this;
  }

  /** Number of colors for quantization (2-256). */
  colors(n: number): this {
    this._colors = n;
    return this;
  }

  /** Color palette preset or custom hex colors. */
  palette(p: Palette): this {
    this._palette = p;
    return this;
  }

  /** Dithering algorithm. */
  dither(method: DitherMethod): this {
    this._dither = method;
    return this;
  }

  /** PDF metadata: document title. */
  pdfTitle(title: string): this {
    this._pdfTitle = title;
    return this;
  }

  /** PDF metadata: document author. */
  pdfAuthor(author: string): this {
    this._pdfAuthor = author;
    return this;
  }

  /** PDF metadata: document subject. */
  pdfSubject(subject: string): this {
    this._pdfSubject = subject;
    return this;
  }

  /** PDF metadata: comma-separated keywords. */
  pdfKeywords(keywords: string): this {
    this._pdfKeywords = keywords;
    return this;
  }

  /** PDF metadata: creator application name. */
  pdfCreator(creator: string): this {
    this._pdfCreator = creator;
    return this;
  }

  /** PDF bookmarks: generate from headings. */
  pdfBookmarks(enabled: boolean): this {
    this._pdfBookmarks = enabled;
    return this;
  }

  /** Build the JSON payload. @internal */
  buildPayload(): RenderPayload {
    const payload: RenderPayload = { format: this._format };

    if (this._html !== undefined) payload.html = this._html;
    if (this._url !== undefined) payload.url = this._url;
    if (this._width !== undefined) payload.width = this._width;
    if (this._height !== undefined) payload.height = this._height;
    if (this._paper !== undefined) payload.paper = this._paper;
    if (this._orientation !== undefined) payload.orientation = this._orientation;
    if (this._margins !== undefined) payload.margins = this._margins;
    if (this._flow !== undefined) payload.flow = this._flow;
    if (this._density !== undefined) payload.density = this._density;
    if (this._background !== undefined) payload.background = this._background;
    if (this._timeout !== undefined) payload.timeout = this._timeout;

    if (
      this._colors !== undefined ||
      this._palette !== undefined ||
      this._dither !== undefined
    ) {
      const q: NonNullable<RenderPayload["quantize"]> = {};
      if (this._colors !== undefined) q.colors = this._colors;
      if (this._palette !== undefined) q.palette = this._palette;
      if (this._dither !== undefined) q.dither = this._dither;
      payload.quantize = q;
    }

    if (
      this._pdfTitle !== undefined ||
      this._pdfAuthor !== undefined ||
      this._pdfSubject !== undefined ||
      this._pdfKeywords !== undefined ||
      this._pdfCreator !== undefined ||
      this._pdfBookmarks !== undefined
    ) {
      const p: NonNullable<RenderPayload["pdf"]> = {};
      if (this._pdfTitle !== undefined) p.title = this._pdfTitle;
      if (this._pdfAuthor !== undefined) p.author = this._pdfAuthor;
      if (this._pdfSubject !== undefined) p.subject = this._pdfSubject;
      if (this._pdfKeywords !== undefined) p.keywords = this._pdfKeywords;
      if (this._pdfCreator !== undefined) p.creator = this._pdfCreator;
      if (this._pdfBookmarks !== undefined) p.bookmarks = this._pdfBookmarks;
      payload.pdf = p;
    }

    return payload;
  }

  /** Send the render request and return raw output bytes. */
  async send(): Promise<Uint8Array> {
    const payload = this.buildPayload();

    let resp: Response;
    try {
      resp = await this.client.doFetch("/render", {
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
