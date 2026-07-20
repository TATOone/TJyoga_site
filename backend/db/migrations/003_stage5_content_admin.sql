-- Stage 5+: content catalog + admin-managed Zoom target

CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY,
  kinescope_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('practices', 'seminars', 'philosophy', 'new')),
  access_level TEXT NOT NULL CHECK (access_level IN ('club_active', 'public')),
  duration_min INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL CHECK (status IN ('published', 'draft')),
  published_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_videos_category ON videos (category);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos (status);

CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('open', 'technique', 'lifestyle', 'club-news')),
  access TEXT NOT NULL CHECK (access IN ('public', 'club')),
  status TEXT NOT NULL CHECK (status IN ('published', 'draft')),
  published_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_access ON articles (access);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles (status);

CREATE TABLE IF NOT EXISTS zoom_links (
  id UUID PRIMARY KEY,
  room TEXT NOT NULL UNIQUE,
  target_url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'rotating')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
