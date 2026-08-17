/**
 * 아라비아 숫자 ↔ 漢数字 변환 (조문 번호용)
 *   toKanji(19) → "十九", toKanji(103) → "百三"
 *   fromKanji("十九") → 19
 * 조문 표기 「第十九条の三」의 枝番은 별도 처리 (egov-law.ts 참조)
 */

const DIGITS = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

export function toKanji(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 9999) {
    throw new Error(`toKanji: 지원 범위 밖 (${n})`);
  }
  if (n === 0) return "〇";
  const units = ["", "十", "百", "千"];
  let out = "";
  const s = String(n);
  for (let i = 0; i < s.length; i++) {
    const d = Number(s[i]);
    const unit = units[s.length - 1 - i];
    if (d === 0) continue;
    // 十・百・千 앞의 「一」은 생략 (十九, 百三)
    out += (d === 1 && unit !== "" ? "" : DIGITS[d]) + unit;
  }
  return out;
}

export function fromKanji(s: string): number {
  const unitValue: Record<string, number> = { 十: 10, 百: 100, 千: 1000 };
  let total = 0;
  let current = 0;
  for (const ch of s) {
    const d = DIGITS.indexOf(ch);
    if (d > 0) {
      current = d;
    } else if (ch in unitValue) {
      total += (current === 0 ? 1 : current) * unitValue[ch];
      current = 0;
    } else if (ch === "〇") {
      current = 0;
    } else {
      throw new Error(`fromKanji: 해석 불가 문자「${ch}」 (${s})`);
    }
  }
  return total + current;
}
