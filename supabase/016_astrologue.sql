-- Unfold / Favorable — "Parle avec un astrologue" conversation state.
-- Tables: astrologue_sessions, astrologue_messages, astrologue_engine_jobs.
--
-- RLS: same posture as 008_ai_guard.sql — service-role writes only via the
-- Next.js API, never readable by a browser. A conversation's content is more
-- sensitive than anything else currently in Supabase: it's what the person
-- is actually going through, in their own words.
--
-- Idempotent, safe to re-run. Run with: npm run db:migrate

-- ─── Sessions ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS astrologue_sessions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Meme identite que connections.owner_device_id (001_initial_tables.sql) :
  -- le device_id choisi cote client, pas l identite anti-abus de ai-guard.
  -- C est deja le niveau de confiance du reste du produit personnalise.
  device_id              TEXT NOT NULL REFERENCES profiles(device_id) ON DELETE CASCADE,
  locale                 TEXT DEFAULT 'en',
  -- Sujet de la conversation : soi-meme, ou une autre personne deja
  -- enregistree dans `connections`. Une conversation ne change pas de sujet
  -- en cours de route — une nouvelle personne ouvre une nouvelle session.
  subject_kind           TEXT NOT NULL DEFAULT 'self' CHECK (subject_kind IN ('self', 'other')),
  subject_connection_id  UUID REFERENCES connections(id) ON DELETE SET NULL,
  -- birthHash() (meme format que delineation_cache.birth_hash) du sujet au
  -- moment de la creation. Sert a detecter une naissance modifiee en cours de
  -- conversation plutot que de continuer a raisonner sur un theme perime en
  -- silence.
  birth_hash             TEXT NOT NULL,
  status                 TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  turn_count             INTEGER NOT NULL DEFAULT 0,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_astrologue_sessions_updated_at ON astrologue_sessions;
CREATE TRIGGER trg_astrologue_sessions_updated_at
  BEFORE UPDATE ON astrologue_sessions
  FOR EACH ROW EXECUTE FUNCTION unfold_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_astrologue_sessions_device
  ON astrologue_sessions(device_id, status, updated_at DESC);

-- ─── Messages ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS astrologue_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID NOT NULL REFERENCES astrologue_sessions(id) ON DELETE CASCADE,
  turn          INTEGER NOT NULL,          -- 1, 2, 3... incremente par tour utilisateur
  role          TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content       TEXT NOT NULL,             -- texte affiche, jamais du JSON brut
  -- Sortie structuree de l Appel A (role='user') ou metadonnees de redaction
  -- de l Appel B (role='assistant' : verdict de silence, maison visee,
  -- boudinId utilise...) — jamais montre a la personne, sert au tour suivant
  -- et au debug.
  structured    JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_astrologue_messages_session
  ON astrologue_messages(session_id, turn);

-- ─── Handoff pour un appel moteur lent ───────────────────────
-- toctoc-boudin-detail (50-57s) et toctoc-app-short (~67s) sont trop lents
-- pour une conversation : demarres en arriere-plan au tour N (via `after()`,
-- app/api/openai/astrologue/message/route.ts), lus au tour N+1.
CREATE TABLE IF NOT EXISTS astrologue_engine_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES astrologue_sessions(id) ON DELETE CASCADE,
  requested_turn  INTEGER NOT NULL,
  endpoint        TEXT NOT NULL CHECK (endpoint IN ('toctoc-boudin-detail', 'toctoc-app-short')),
  -- Hash stable du corps envoye au moteur (birthData + boudinLabel/groupId) —
  -- sert de cle d unicite pour ne pas relancer deux fois le meme appel lent
  -- si l utilisateur enchaine des tours pendant que le job tourne encore.
  params_hash     TEXT NOT NULL,
  params          JSONB NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'failed')),
  result          JSONB,
  error           TEXT,
  consumed_at     TIMESTAMPTZ,            -- non NULL = deja lu par un tour suivant
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_astrologue_engine_job UNIQUE (session_id, endpoint, params_hash)
);

DROP TRIGGER IF EXISTS trg_astrologue_engine_jobs_updated_at ON astrologue_engine_jobs;
CREATE TRIGGER trg_astrologue_engine_jobs_updated_at
  BEFORE UPDATE ON astrologue_engine_jobs
  FOR EACH ROW EXECUTE FUNCTION unfold_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_astrologue_engine_jobs_session
  ON astrologue_engine_jobs(session_id, status);

ALTER TABLE astrologue_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE astrologue_messages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE astrologue_engine_jobs  ENABLE ROW LEVEL SECURITY;
-- No policy on purpose, same reasoning as 008_ai_guard.sql: service-role only.
