import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <p className="text-5xl font-bold text-brand-800">404</p>
      <h1 className="mt-4 text-xl font-bold text-gray-900">
        ページが見つかりません
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        お探しのページは移動または削除された可能性があります。
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-md bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        トップページへ戻る
      </Link>
    </div>
  );
}
