import type { Dictionary } from "@/i18n/dictionary-schema";
import type { Locale } from "@/i18n/locales";
import { en } from "@/i18n/dictionaries/en";
import { zhCN } from "@/i18n/dictionaries/zh-CN";
import { zhTW } from "@/i18n/dictionaries/zh-TW";
import { vi } from "@/i18n/dictionaries/vi";
import { ko } from "@/i18n/dictionaries/ko";
import { fil } from "@/i18n/dictionaries/fil";
import { ne } from "@/i18n/dictionaries/ne";
import { id } from "@/i18n/dictionaries/id";
import { th } from "@/i18n/dictionaries/th";

export const dictionaries: Record<Locale, Dictionary> = {
  en,
  "zh-CN": zhCN,
  "zh-TW": zhTW,
  vi,
  ko,
  fil,
  ne,
  id,
  th,
};
