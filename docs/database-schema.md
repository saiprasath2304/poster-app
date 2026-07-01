# Database schema (for a future backend)

The app currently persists everything to `localStorage` (no backend). This is
the schema to migrate to once a backend is added — it maps almost 1:1 onto
the TypeScript types in `src/lib/types/index.ts`, so the API layer stays a
thin translation rather than a redesign.

```sql
-- Organizations using the poster builder
CREATE TABLE organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Users (future auth)
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email           VARCHAR(255) UNIQUE NOT NULL,
  role            VARCHAR(20) NOT NULL DEFAULT 'editor', -- 'admin' | 'editor'
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One row per monthly poster
CREATE TABLE posters (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id    UUID REFERENCES organizations(id) ON DELETE CASCADE,
  organization_name  VARCHAR(255) NOT NULL,
  month              VARCHAR(20) NOT NULL,
  year               INT NOT NULL,
  table_title        VARCHAR(255) NOT NULL,
  date_column_label  VARCHAR(50) NOT NULL DEFAULT 'Date',
  theme_id           VARCHAR(50) NOT NULL DEFAULT 'default-spiritual',
  logo_url           TEXT,
  logo_position      VARCHAR(20) DEFAULT 'top-left',
  logo_size          INT DEFAULT 64,
  logo_opacity       NUMERIC(3,2) DEFAULT 1,
  font_scale         NUMERIC(3,2) DEFAULT 1,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, month, year)
);

-- Individual dated events on a poster
CREATE TABLE poster_events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poster_id      UUID REFERENCES posters(id) ON DELETE CASCADE,
  date_label     VARCHAR(50) NOT NULL,   -- "04 Jul"
  day_label      VARCHAR(20) NOT NULL,   -- "Saturday"
  iso_date       DATE NOT NULL,
  title          VARCHAR(255) NOT NULL,
  description    TEXT,
  start_time     VARCHAR(20),
  end_time       VARCHAR(20),
  color          VARCHAR(20),
  highlight      BOOLEAN NOT NULL DEFAULT false,
  sort_order     INT NOT NULL DEFAULT 0,
  recurrence_rule_id UUID REFERENCES poster_recurrence_rules(id) ON DELETE SET NULL
);

-- Recurring schedule rules (e.g. "every Thursday")
CREATE TABLE poster_recurrence_rules (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poster_id      UUID REFERENCES posters(id) ON DELETE CASCADE,
  type           VARCHAR(20) NOT NULL,     -- 'weekly' | 'monthly' | 'custom'
  day_of_week    INT,                      -- 0-6, for 'weekly'
  day_of_month   INT,                      -- for 'monthly'
  custom_dates   DATE[],                   -- for 'custom'
  title          VARCHAR(255) NOT NULL,
  description    TEXT,
  highlight      BOOLEAN NOT NULL DEFAULT false
);

-- Timed items belonging to a recurrence rule (e.g. "06:00 PM Vedam")
CREATE TABLE poster_recurrence_items (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recurrence_rule_id UUID REFERENCES poster_recurrence_rules(id) ON DELETE CASCADE,
  time               VARCHAR(20),
  label              VARCHAR(255) NOT NULL,
  sort_order         INT NOT NULL DEFAULT 0
);

-- Footer schedule blocks (left/right columns)
CREATE TABLE poster_footer_sections (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poster_id      UUID REFERENCES posters(id) ON DELETE CASCADE,
  title          VARCHAR(255) NOT NULL,
  dates          VARCHAR(20)[],
  position       VARCHAR(10) NOT NULL DEFAULT 'left', -- 'left' | 'right'
  visible        BOOLEAN NOT NULL DEFAULT true,
  sort_order     INT NOT NULL DEFAULT 0
);

CREATE TABLE poster_footer_items (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  footer_section_id  UUID REFERENCES poster_footer_sections(id) ON DELETE CASCADE,
  time               VARCHAR(20),
  label              VARCHAR(255) NOT NULL,
  sort_order         INT NOT NULL DEFAULT 0
);

-- Reusable saved templates
CREATE TABLE poster_templates (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name           VARCHAR(255) NOT NULL,
  snapshot_json  JSONB NOT NULL, -- full PosterData snapshot; simplest durable format
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_poster_events_poster_id ON poster_events(poster_id);
CREATE INDEX idx_poster_footer_sections_poster_id ON poster_footer_sections(poster_id);
CREATE INDEX idx_poster_templates_org_id ON poster_templates(organization_id);
```

## Migration path from localStorage

1. `src/lib/services/templateService.ts` and `src/lib/stores/posterStore.ts`
   are the only two files that talk to `localStorage` directly.
2. Replace their internal `readAll`/`writeAll`/`persist`/`loadInitial`
   helpers with `fetch()` calls to REST (or tRPC/GraphQL) endpoints backed by
   the schema above — the public function signatures (`addEvent`,
   `updateFooterSection`, `templateService.save`, etc.) don't need to change,
   so no component code needs to be touched.
3. `PosterJsonExport` (already used for Import/Export JSON) is a convenient
   shape for a `POST /api/posters` request body.
