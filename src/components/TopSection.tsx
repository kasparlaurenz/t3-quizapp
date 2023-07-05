import Link from "next/link";
import { useRouter } from "next/router";
import type { FC } from "react";

interface TopSectionProps {
  title?: string;
  isPlay?: boolean;
}

const TopSection: FC<TopSectionProps> = ({ title, isPlay }) => {
  const router = useRouter();
  return (
    <div className="fixed z-10 flex w-full items-center justify-center gap-8 bg-neutral-900 p-6">
      <button
        onClick={() => {
          isPlay ? router.reload() : router.back();
        }}
        className="menu-button mt-0 w-fit bg-slate-400 text-gray-900"
      >
        Zurück
      </button>
      <h1 className="text-3xl font-bold text-sky-300">{title}</h1>
      <Link
        className="menu-button mt-0 w-fit bg-slate-400 text-gray-900"
        href="/dashboard"
      >
        Menü
      </Link>
    </div>
  );
};

export default TopSection;
