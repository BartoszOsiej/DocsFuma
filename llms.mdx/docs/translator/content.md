# 📖 PDF Book Viewer & Translator (/docs/translator)



# 📖 PDF Book Viewer & Translator [#-pdf-book-viewer--translator]

> **Read any PDF like a real book — page by page, with a visual page-flip —
> and translate it on the spot, straight from the browser. No key, no
> account, no server.**

This page is a live demo of the translator module built into this docs hub.
Pick a sample below and press **Translate page** (or **Translate all**) to
watch a page get converted to Polish — rendered right on the book page.

You can also **open any PDF from your computer** with the 📂 *Open PDF*
button (or by dragging & dropping a file onto the viewer) — it is read
entirely in your browser, never uploaded.

<PdfBookViewer
src="/pdfs/sample-english.pdf"
title="Sample — English Manual"
/>

<PdfBookViewer
src="/pdfs/sample-polish.pdf"
title="Przykład — Polski Dokument"
/>

<PdfBookViewer title="Your PDF here — drop a file to start" />

***

## ✨ What it does [#-what-it-does]

| Capability                    | Detail                                                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 📚 **Visual book reading**    | PDF pages are rendered as an open book — two pages per spread, a spine, page shadows and a 3D page-flip when you turn          |
| 🔎 **Live text extraction**   | Page text is pulled with pdf.js (`getTextContent`) — works for any text-based PDF                                              |
| 🌐 **Keyless translation**    | Page text is translated in the browser via free, CORS-enabled providers (Google's public endpoint first, MyMemory as fallback) |
| 🔤 **Auto-detect source**     | Choose *Auto-detect* and the module guesses the source language from the page content                                          |
| 📑 **Per-page or whole book** | *Translate page* handles the current page; *Translate all* queues every page with a progress bar                               |
| 🖼️ **On-page overlay**       | Translated text can be shown over the page itself, or read in the panel below the book                                         |
| ⌨️ **Keyboard friendly**      | `←` / `→` arrow keys turn the pages                                                                                            |
| 📂 **Open your own PDFs**     | Load any PDF from your computer (file picker or drag & drop) — processed 100% client-side                                      |

## 🧪 Try it [#-try-it]

1. Flip through the sample PDFs with the arrows (or `←` / `→`).
2. Set the target language (default: **Polski**).
3. Press **Translate page** — the translation appears in the panel and on the page.
4. Press **Translate all** to translate the whole book.
5. **Open your own PDF** — click 📂 *Open PDF* and pick a file, or just drag &
   drop it onto the viewer. The file is processed entirely in your browser.
6. Embed the component with a different `src` to show a static PDF instead.

## 🔌 Embedding it in your docs [#-embedding-it-in-your-docs]

The component is registered globally, so any Markdown page can embed it:

```md
<PdfBookViewer src="/pdfs/sample-english.pdf" title="My Book" />
```

To let readers open their own PDF (no `src`), embed it without a source:

```md
<PdfBookViewer title="Upload your PDF" />
```

In both cases the 📂 *Open PDF* button and drag & drop are available.

| Prop          | Type   | Default    | Description                                                                                                                                          |
| ------------- | ------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src`         | string | —          | Optional PDF URL. Absolute paths are resolved against the site base; http(s) URLs load directly. Omit it to get a file-picker / drag-and-drop viewer |
| `title`       | string | `PDF Book` | Book title (shown in the toolbar and on the cover)                                                                                                   |
| `initialPage` | number | `1`        | Page the book opens on                                                                                                                               |

## 🛠️ How it works under the hood [#️-how-it-works-under-the-hood]

```
PDF (URL) ──► pdf.js ──► canvas pages ──► book layout (spread + flip)
                  │
                  └── getTextContent() ──► chunk by length
                                                │
                                                ▼
                       translate.googleapis.com (Google, primary)
                                    │  on failure
                       api.mymemory.translated.net (MyMemory, fallback)
                                                │
                                                ▼
                       per-page translations ──► panel + on-page overlay
```

* **Rendering:** [pdf.js](https://mozilla.github.io/pdf.js/) renders every page
  to a `&lt;canvas&gt;`. The worker and the standard-14 font data are vendored in
  `public/pdfjs/` so the viewer works offline — no CDN.
* **Local files:** picking a file (or dropping it) reads it with
  `File.arrayBuffer()` and hands the raw bytes to `pdf.js`
  (`getDocument({ data })`) — the PDF never leaves the browser.
* **Text extraction:** `page.getTextContent()` returns positioned text spans;
  they are joined into paragraphs and chunked (Google: \~4 500 chars,
  MyMemory: \~450 chars) to stay inside each API's limits.
* **Translation:** a small provider chain tries the keyless Google endpoint
  first and falls back to MyMemory. Auto-detection of the source language
  also uses the Google endpoint.
* **Book layout:** pages are laid out as spreads (cover page alone on the
  right, then 2+3, 4+5, …). Page turns are CSS 3D transforms (`rotateY`) with
  `perspective`, so the moving page flips like a real leaf.

## 🔑 About Microsoft Translator [#-about-microsoft-translator]

This site originally asked for a **Microsoft Translator embedded API**. Two
things to know:

1. Microsoft's free **Translator Web Widget** (the classic embed) was
   **retired in 2019** — it no longer exists.
2. The modern **Azure Translator REST API** works perfectly, but requires a
   **subscription key + region**, which cannot be shared on a public static
   site.

So this module ships **keyless by default** (Google + MyMemory, both free,
CORS-enabled, no account). A **Microsoft Translator provider** is included
behind the same interface in `src/lib/translator.ts` — if you have an
Azure key, pass `microsoftKey` / `microsoftRegion` to `translateText()` and it
is tried first. The docs stay free and keyless for everyone else.

## 📄 Sample files [#-sample-files]

The two demo PDFs are generated from
[`scripts/gen-sample-pdfs.mjs`](https://github.com/BartoszOsiej/Docs/blob/main/scripts/gen-sample-pdfs.mjs)
(a dependency-free PDF writer) and live in `public/pdfs/`:

* `sample-english.pdf` — 3 pages of English text
* `sample-polish.pdf` — 2 pages of Polish text

## 📚 Related [#-related]

* [Docs Hub](/)
* [Project catalog](/docs/projects/)
