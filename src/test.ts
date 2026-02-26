import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ForgeClient, RenderRequestBuilder } from "./index.js";

describe("ForgeClient", () => {
  it("strips trailing slash from base URL", () => {
    const client = new ForgeClient("http://localhost:3000/");
    const builder = client.renderHtml("<h1>Hi</h1>");
    const payload = builder.buildPayload();
    assert.equal(payload.html, "<h1>Hi</h1>");
  });
});

describe("RenderRequestBuilder", () => {
  const client = new ForgeClient("http://localhost:3000");

  it("builds minimal HTML payload", () => {
    const payload = client.renderHtml("<h1>Hi</h1>").buildPayload();
    assert.equal(payload.html, "<h1>Hi</h1>");
    assert.equal(payload.format, "pdf");
    assert.equal(payload.url, undefined);
    assert.equal(payload.width, undefined);
    assert.equal(payload.quantize, undefined);
  });

  it("builds URL payload with all options", () => {
    const payload = client
      .renderUrl("https://example.com")
      .format("png")
      .width(1280)
      .height(800)
      .paper("letter")
      .orientation("landscape")
      .margins("10,20,10,20")
      .flow("paginate")
      .density(300)
      .background("#ffffff")
      .timeout(60)
      .buildPayload();

    assert.equal(payload.html, undefined);
    assert.equal(payload.url, "https://example.com");
    assert.equal(payload.format, "png");
    assert.equal(payload.width, 1280);
    assert.equal(payload.height, 800);
    assert.equal(payload.paper, "letter");
    assert.equal(payload.orientation, "landscape");
    assert.equal(payload.margins, "10,20,10,20");
    assert.equal(payload.flow, "paginate");
    assert.equal(payload.density, 300);
    assert.equal(payload.background, "#ffffff");
    assert.equal(payload.timeout, 60);
    assert.equal(payload.quantize, undefined);
  });

  it("builds quantize payload", () => {
    const payload = client
      .renderHtml("<p>test</p>")
      .format("png")
      .colors(16)
      .palette("auto")
      .dither("floyd-steinberg")
      .buildPayload();

    assert.deepEqual(payload.quantize, {
      colors: 16,
      palette: "auto",
      dither: "floyd-steinberg",
    });
  });

  it("builds quantize with custom palette", () => {
    const payload = client
      .renderHtml("<p>test</p>")
      .palette(["#000000", "#ffffff", "#ff0000"])
      .dither("atkinson")
      .buildPayload();

    assert.deepEqual(payload.quantize, {
      palette: ["#000000", "#ffffff", "#ff0000"],
      dither: "atkinson",
    });
  });

  it("omits quantize when unset", () => {
    const payload = client
      .renderHtml("<p>test</p>")
      .format("png")
      .buildPayload();

    assert.equal(payload.quantize, undefined);
  });

  it("builds pdf metadata payload", () => {
    const payload = client
      .renderHtml("<h1>Report</h1>")
      .format("pdf")
      .pdfTitle("Quarterly Report")
      .pdfAuthor("Centrix Systems")
      .pdfSubject("Q4 2025 Financial Summary")
      .pdfKeywords("finance,quarterly,report")
      .pdfCreator("Centrix ERP")
      .pdfBookmarks(true)
      .buildPayload();

    assert.deepEqual(payload.pdf, {
      title: "Quarterly Report",
      author: "Centrix Systems",
      subject: "Q4 2025 Financial Summary",
      keywords: "finance,quarterly,report",
      creator: "Centrix ERP",
      bookmarks: true,
    });
  });

  it("builds pdf with partial options", () => {
    const payload = client
      .renderHtml("<h1>Hello</h1>")
      .pdfTitle("My Doc")
      .pdfBookmarks(false)
      .buildPayload();

    assert.deepEqual(payload.pdf, {
      title: "My Doc",
      bookmarks: false,
    });
  });

  it("omits pdf when unset", () => {
    const payload = client
      .renderHtml("<p>test</p>")
      .format("pdf")
      .buildPayload();

    assert.equal(payload.pdf, undefined);
  });
});
