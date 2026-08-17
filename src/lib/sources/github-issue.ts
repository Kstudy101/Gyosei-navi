/**
 * GitHub Issue 起票（gh CLI 経由）
 *   - GITHUB_TOKEN と gh があれば動く。GitHub Actions 上では GH_TOKEN が自動注入される
 *   - 로컬에서는 `gh auth login` 상태면 동작
 */
import { execFileSync } from "node:child_process";

export function createGithubIssue(params: {
  title: string;
  body: string;
  labels: string[];
}): { ok: true; url: string } | { ok: false; error: string } {
  const args = ["issue", "create", "--title", params.title, "--body", params.body];
  for (const l of params.labels) args.push("--label", l);
  try {
    const out = execFileSync("gh", args, { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] });
    return { ok: true, url: out.trim() };
  } catch (e) {
    const err = e as { stderr?: string; message?: string };
    return { ok: false, error: (err.stderr ?? err.message ?? String(e)).trim() };
  }
}
