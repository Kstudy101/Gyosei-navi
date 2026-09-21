-- gyosei-navi published 기사 메타데이터 캐시 (검색·매칭용, 콘텐츠 정본 아님)
-- 정본은 여전히 gyosei-navi 리포의 content/*.mdx다. 이 테이블은
-- "npm run export:articles-for-seo" 결과를 동기화한 사본일 뿐이며,
-- SEO Engine이 이 테이블을 직접 수정해 gyosei-navi 콘텐츠에 영향을 주지 않는다.
CREATE TABLE gyosei_articles (
  slug TEXT PRIMARY KEY,
  section TEXT NOT NULL,
  category TEXT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_keywords TEXT[] NOT NULL DEFAULT '{}',
  source_links JSONB NOT NULL DEFAULT '[]',
  published_at DATE NOT NULL,
  updated_at DATE NOT NULL,
  href TEXT NOT NULL,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_gyosei_articles_section_category ON gyosei_articles (section, category);
CREATE INDEX idx_gyosei_articles_keywords ON gyosei_articles USING GIN (target_keywords);

ALTER TABLE gyosei_articles ENABLE ROW LEVEL SECURITY;
