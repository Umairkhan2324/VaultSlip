-- ReceiptAI schema: organizations, profiles, batches, receipts, receipt_items,
-- usage_tracking, enterprise_leads, chat_messages. No Stripe columns.

CREATE TABLE organizations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    plan            TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'enterprise')),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email           TEXT NOT NULL,
    role            TEXT NOT NULL CHECK (role IN ('admin', 'member')) DEFAULT 'member',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE batches (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status          TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'done', 'partial', 'failed')) DEFAULT 'pending',
    total_files     INT NOT NULL,
    processed       INT DEFAULT 0,
    failed          INT DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE receipts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    batch_id        UUID REFERENCES batches(id) ON DELETE SET NULL,
    image_url       TEXT NOT NULL,
    raw_json        JSONB NOT NULL,
    vendor          TEXT,
    date            DATE,
    total           NUMERIC(12, 2),
    tax             NUMERIC(12, 2),
    currency        VARCHAR(3) DEFAULT 'USD',
    category        TEXT,
    confidence      FLOAT CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
    needs_review    BOOLEAN DEFAULT FALSE,
    is_deleted      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE receipt_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id      UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
    description     TEXT NOT NULL,
    quantity        NUMERIC(10, 2),
    unit_price      NUMERIC(12, 2),
    subtotal        NUMERIC(12, 2),
    confidence      FLOAT
);

CREATE TABLE usage_tracking (
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    year            INT NOT NULL,
    month           INT NOT NULL,
    receipts_processed INT DEFAULT 0,
    PRIMARY KEY (org_id, year, month)
);

CREATE TABLE enterprise_leads (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    email           TEXT NOT NULL,
    company         TEXT,
    message         TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role            TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content         TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_receipts_org_id ON receipts(org_id);
CREATE INDEX idx_receipts_batch_id ON receipts(batch_id);
CREATE INDEX idx_batches_org_id ON batches(org_id);
CREATE INDEX idx_profiles_org_id ON profiles(org_id);
