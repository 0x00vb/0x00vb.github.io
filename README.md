# Writing

Live site: [0x00vb.github.io](https://0x00vb.github.io/)

Markdown articles, plain HTML/CSS/JavaScript, and automatic GitHub Pages deployment. No CMS or frontend framework.

## Edit a post on GitHub

1. Open [content/posts](https://github.com/0x00vb/0x00vb.github.io/tree/main/content/posts).
2. Open an article and click the pencil button. Edit its Markdown text.
3. Commit the change to `main`. [GitHub Actions](https://github.com/0x00vb/0x00vb.github.io/actions/workflows/pages.yml) checks and publishes it automatically.

The filename is its public URL. Keep it unchanged when editing an existing article so shared links continue to work.

## Add a post locally

```sh
git clone https://github.com/0x00vb/0x00vb.github.io.git
cd 0x00vb.github.io
npm ci
npm run new -- "A useful question" --topic systems
npm run dev
```

Open http://localhost:4173. The new file is in `content/posts/a-useful-question.md`. Edit the title, one-sentence description, concepts, and body. Available topics: `ai`, `systems`, `security`, `design`, `essays`.

Optional arguments: `--date 2026-11-04` sets the archive date, and `--slug another-filename` sets the filename. Existing files are never overwritten.

The local preview includes drafts. Content and asset changes rebuild automatically; reload the browser to see them. Restart the server after changing build scripts.

## Publish the post

In its frontmatter, change:

```yaml
status: published
published: 2026-11-04
```

Use the actual publication date. Then commit and push:

```sh
git add content/posts
git commit -m "Publish a new article"
git push
```

Pushes to `main` run tests, build the site, and deploy it. Pull requests run checks without deploying. Watch the Actions tab for the deployment result.

## Add a post entirely on GitHub

Copy [content/TEMPLATE.md](https://github.com/0x00vb/0x00vb.github.io/blob/main/content/TEMPLATE.md), then use **Add file > Create new file** inside `content/posts/`. Give it a lowercase filename with hyphens and a `.md` extension. Write the article and commit to `main`.

Keep `status: draft` while editing. Drafts stay out of the public site, RSS, sitemap, and production search index. They remain visible in the public repository, so do not commit confidential notes. Set `status: published` and add the actual publication date when ready.

## Article metadata

See [content/SCHEMA.md](content/SCHEMA.md) for the complete contract.

- `date`: the editorial date shown in the archive and reader. It controls chronological order.
- `written`: actual drafting date.
- `published`: actual online publication date, required for published posts.
- `concepts`: shared ideas used to build connections between articles.
- `order`: tie-breaker when dates match; the helper sets it to zero.

The initial nineteen articles use archive dates from their subject eras, 2022 through 2026. Their first online publication date is November 4, 2026.

## Readership analytics

Optional aggregate analytics uses GoatCounter. No tracking script is included unless the repository variable below is set. Local draft previews never send analytics, even when an endpoint is configured.

1. Create or choose a GoatCounter site and copy its endpoint, such as `https://YOUR-CODE.goatcounter.com/count`.
2. In this GitHub repository, open **Settings > Secrets and variables > Actions > Variables**.
3. Create `GOATCOUNTER_URL` with that endpoint as its value.
4. Open **Actions > Publish writing > Run workflow** to redeploy.

Or use the GitHub CLI after replacing YOUR-CODE:

```sh
gh variable set GOATCOUNTER_URL --body 'https://YOUR-CODE.goatcounter.com/count' --repo 0x00vb/0x00vb.github.io
gh workflow run pages.yml --repo 0x00vb/0x00vb.github.io
```

Use the provider dashboard for page views, popular articles, referrers, and visitor estimates. Counts begin when enabled; they are not retroactive and do not identify individual readers. The integration counts page paths rather than archive search queries. Ad blockers can affect totals. No seeded view counts are used.

## Diagrams

Keep editable `.excalidraw` scenes in `content/diagrams/`. Open them at https://excalidraw.com. Every `.excalidraw` file in `content/diagrams/` is exported automatically. The renderer uses the scene coordinates, text, colors, font sizes, and arrow direction, with bounds computed from the drawing. Rectangles, lines, arrows, ellipses, and text are supported. Unsupported elements fail the build explicitly; extend `scripts/diagrams.mjs` before using them. Builds never rewrite the source scenes.

In a post, reference a diagram like this:

```md
![Explain the diagram in one sentence.](../../diagrams/route-pipeline.svg)
```

See [content/VOICE.md](content/VOICE.md) for the editorial rules. The current agent series covers the runtime boundary, model routing, prompt-cache layout, and durable state after compaction.

## Development checks

```sh
npm test
SITE_URL=https://0x00vb.github.io npm run build
```

Output goes to `dist/`. It is generated and should not be edited. For a repository Pages path instead of the root domain, set `BASE_PATH=/repository-name`.

The graph uses accessible HTML buttons with optional WebGL depth; SVG is the fallback for reduced motion, touch-only pointers, or unavailable graphics. Search works across article text. Reading and navigation work without JavaScript.

The mono font is self-hosted from `geist` under the SIL Open Font License, included in the built site's fonts directory.
