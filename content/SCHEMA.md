# Article contract

Each content/posts/*.md file has YAML frontmatter:

- title: nonempty string
- description: one sentence
- topic: ai | systems | security | design | essays
- concepts: nonempty array of shared lowercase concept slugs
- date: optional editorial archive date, displayed without a publication claim
- written: ISO YYYY-MM-DD, actual drafting date
- status: draft | published
- published: ISO date, required only for published articles
- order: integer, archive sort order
- period: optional subject-era string, not a publication claim

The filename is the public slug. The builder validates at its boundary, rejects invalid metadata, renders Markdown into /writing/<slug>/index.html, and emits search JSON. Drafts are visible in local preview with a draft label and excluded from production builds, RSS, and sitemap. PREVIEW_DRAFTS=1 includes them. Topic selection, query, and concept selection form one homepage archive state. Graph buttons filter the article list in place. Static links remain the navigation model.
