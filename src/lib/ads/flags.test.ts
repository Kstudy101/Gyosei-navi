import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { isRakutenAffiliateEnabled, isRakutenApiAdEnabled, isRakutenMotionWidgetEnabled } from "@/lib/ads/flags";

const FLAG_KEYS = ["RAKUTEN_AFFILIATE_ENABLED", "RAKUTEN_API_AD_ENABLED", "RAKUTEN_MOTION_WIDGET_ENABLED"] as const;

afterEach(() => {
  for (const key of FLAG_KEYS) delete process.env[key];
});

test("전체 ON (미설정 기본값): 두 광고 모두 표시", () => {
  assert.equal(isRakutenAffiliateEnabled(), true);
  assert.equal(isRakutenApiAdEnabled(), true);
  assert.equal(isRakutenMotionWidgetEnabled(), true);
});

test("전체 OFF (마스터 스위치): 광고 없음", () => {
  process.env.RAKUTEN_AFFILIATE_ENABLED = "false";
  assert.equal(isRakutenApiAdEnabled(), false);
  assert.equal(isRakutenMotionWidgetEnabled(), false);
});

test("API OFF: Motion Widget만 표시", () => {
  process.env.RAKUTEN_API_AD_ENABLED = "false";
  assert.equal(isRakutenApiAdEnabled(), false);
  assert.equal(isRakutenMotionWidgetEnabled(), true);
});

test("Motion OFF: API 추천만 표시", () => {
  process.env.RAKUTEN_MOTION_WIDGET_ENABLED = "false";
  assert.equal(isRakutenApiAdEnabled(), true);
  assert.equal(isRakutenMotionWidgetEnabled(), false);
});

test("마스터 스위치가 하위 플래그보다 우선한다", () => {
  process.env.RAKUTEN_AFFILIATE_ENABLED = "false";
  process.env.RAKUTEN_API_AD_ENABLED = "true";
  process.env.RAKUTEN_MOTION_WIDGET_ENABLED = "true";
  assert.equal(isRakutenApiAdEnabled(), false);
  assert.equal(isRakutenMotionWidgetEnabled(), false);
});
