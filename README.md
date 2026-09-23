# @kvass/sorting

`<kvass-sorting>` is the editor Kvass uses to compose a page: it lets an editor
reorder the blocks on a page, add and remove blocks, and configure each one.

It is a Vue 3 app compiled to a **custom element**, so the host page needs no Vue
of its own — it drops in a `<script type="module">` and one tag. Today the only
host is `client-admin`, which renders it behind the **"Tilpass rekkefølge"** and
**"Rediger felter"** buttons on a project's or page's front page settings.

## What it does

The component is handed two things: the blocks a template *offers* (`config`) and
the blocks the page *currently uses* (`value`). It returns a new ordered list.

- **Reorder** — drag and drop (`vuedraggable`). Items marked `fixed` can be
  clicked but not dragged.
- **Add / remove** — only in `mode="build"`. "Legg til" opens a picker; select a
  card, then confirm with the picker's own "Legg til" button. "Legg til alle"
  adds every available block at once.
- **Per-item settings** — a block can declare `settings`, rendered as a small
  form in a dialog on the item. Values are stored on that item's `data`.
- **Alternatives** — a block can declare `alternatives`, giving the editor an
  "Erstatt med" dropdown to swap it for another block. The choice is stored as
  `data.replaceBy`.

The two modes matter:

| mode | what the editor can do |
| --- | --- |
| `sort` (default) | reorder only |
| `build` | reorder, add, remove, duplicate |

## Where it is published

Published to npm as **`@kvass/sorting`** by `.github/workflows/semantic-release.yml`,
which runs `npx semantic-release` on **every push to `master`**. Commits follow
conventional commits (`fix:`, `feat:` …) — that is what decides the version bump.

Consumers load it straight from a CDN rather than as a dependency:

```
https://cdn.jsdelivr.net/npm/@kvass/sorting@latest/dist/sorting.js
```

> **Merging to `master` ships to production immediately.** The consumer pins
> `@latest`, so there is no version gate between a merge and every Kvass admin
> user. Test locally first — see below.

## Usage

```html
<kvass-sorting></kvass-sorting>

<script type="module" src="https://cdn.jsdelivr.net/npm/@kvass/sorting@latest/dist/sorting.js"></script>
<script>
  const el = document.querySelector('kvass-sorting')
  el.setAttribute('config', JSON.stringify(availableBlocks))
  el.setAttribute('value', JSON.stringify(currentLayout))
  el.addEventListener('webcomponent:update', ({ detail }) => {
    // detail.state: 'save' | 'reset' | 'close'
    // detail.value: the new layout
  })
</script>
```

### Attributes

Everything crosses the custom-element boundary as a string, so objects and
arrays must be JSON-encoded.

| attribute | type | description |
| --- | --- | --- |
| `config` | JSON array | The blocks this template offers. Required. |
| `value` | JSON array | The page's current layout, `[{ key, data }]`. Empty ⇒ show everything from `config`. |
| `mode` | `'sort'` \| `'build'` | Default `'sort'`. |
| `disable-reset` | boolean | Hides the reset / "Legg til alle" button. |
| `labels` | JSON object | Overrides the Norwegian defaults (`title`, `subtitle`, `reset`, `addAll`, `cancel`, `confirm`, `alert`). |

### Config item

```js
{
  key: 'project-hero',                     // identity — must be stable
  label: 'Forsidebilde og introduksjon',
  thumbnail: 'fa-pro-regular:house',       // icon name, comma-separated icons, or an image URL
  fixed: true,                             // cannot be dragged
  tags: ['Forside'],                       // shown under the label
  limit: { min: 0, max: 1 },
  alternatives: ['flatfinder'],            // offered under "Erstatt med"
  settings: 'Input:title:Tittel',          // "Component:key:label", comma-separated for several
}
```

`thumbnail` picks a renderer by shape: a value starting with `https` or `/` is an
image, anything else is treated as one or more Iconify icon names.

`limit` is doing two different jobs:

- `min: 0` — the block is always present, so it is **excluded from the add
  picker**. (Kvass server also reads `min === 0` to seed a project's default layout.)
- `max: n` — once `n` copies exist, the block disappears from the available list.

`settings` is a compact string, not an object: `"Component:key:label"`, joined by
commas for several fields. Only `Input` is implemented today (`Settings/Field.vue`).

### Output

The component dispatches a bubbling, composed `webcomponent:update` event:

| `state` | `value` |
| --- | --- |
| `save` | `[{ key, data }]` — or `[]` when nothing changed in `sort` mode |
| `reset` | `[]` (host should fall back to the template default) |
| `close` | `undefined` (cancelled — do nothing) |

## Local development

### Prerequisite: `.npmrc`

`@kvass/ui` is a private package, so `pnpm install` fails with `401 Unauthorized`
until npm is authenticated. Create an `.npmrc` in the repo root:

```
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

with an npm token that can read the `@kvass` scope — either inline, or via an
`NPM_TOKEN` environment variable. The file is gitignored and must never be
committed. CI does the same thing from the `NPM_TOKEN` secret
(`.github/workflows/semantic-release.yml`).

### Running it

```bash
pnpm install
pnpm dev          # http://localhost:3010
```

`index.html` is the playground. It seeds three items that between them cover every
thumbnail renderer — an image URL, a single icon, and a comma-separated pair — so
it is usually enough to verify rendering changes without involving client-admin.

```bash
pnpm build        # → dist/sorting.js (+ dist/sorting.css)
```

### Testing a change inside client-admin

The playground does not exercise the real block config. To do that, build here and
serve the file from client-admin's **own origin** — you cannot point at the dev
server, because client-admin runs on HTTPS (`local.kvass.test`) and the browser
blocks an HTTP script as mixed content, and a symlink does not work either since
the container only mounts `client-admin` at `/usr/app`.

```bash
pnpm build && cp dist/sorting.js ../../client-admin/public/sorting-local.js
```

Then temporarily point `source` in
`client-admin/src/components/FieldBuilder/Component.vue` at `/sorting-local.js`,
and reload. Remember to revert that line and delete the copied file — it is ~800 KB
of build output.

## Notes

- The component ships **no translations**. Every string an editor sees is either a
  default in the `labels` prop or passed in by the host. The `i18n:build` script in
  `package.json` is a leftover and nothing in `src/` consumes it.
- `dist/sorting.css` is emitted but no consumer loads it. Component styles are
  inlined into the shadow root by `defineCustomElement`; the file is `@kvass/ui`'s
  stylesheet, extracted because `main.js` imports it.
- Styling hooks are exposed as CSS custom properties on the host element
  (`--kvass-sorting-item-thumbnail-width`, `--kvass-sorting-item-background`, …).
  They inherit through the shadow boundary, so the host page sets them.
