import { motion } from "motion/react";
import { useState } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { ImageCard } from "../components/art";
import { Avatar, Button, FilterChips, TopBar, useToast } from "../components/primitives";
import { useStore } from "../data/store";
import type { AddaPost, AddaPostKind } from "../data/types";
import { bn, cx, timeAgo } from "../lib/format";
import { useNav } from "../nav";

const KIND_LABEL: Record<AddaPostKind, string> = { story: "চিঠির গল্প", memory: "স্মৃতি", question: "প্রশ্ন", photo: "ছবি", topic: "বিষয়" };

/**
 * পোস্টম্যান আড্ডা — calm, editorial, finite. The feed ends; we say so,
 * and invite the reader to write a letter instead of scrolling more.
 */
export function AddaScreen() {
  const s = useStore();
  const nav = useNav();
  const [kind, setKind] = useState<"all" | AddaPostKind>("all");
  const posts = kind === "all" ? s.adda : s.adda.filter((p) => p.kind === kind);

  return (
    <div className="pb-16">
      <TopBar large title="পোস্টম্যান আড্ডা" subtitle="চিঠি, স্মৃতি আর গল্প ঘিরে কিছু মানুষ।" onBack={nav.pop} />
      <div className="px-4">
        <div className="mt-2">
          <FilterChips value={kind} onChange={setKind} items={[{ id: "all", label: "সব" }, ...(["story", "memory", "question", "photo"] as AddaPostKind[]).map((id) => ({ id, label: KIND_LABEL[id] }))]} />
        </div>

        {/* Today's topic — one prompt, not an algorithm */}
        <div className="mt-6 rounded-dk-lg bg-dk-gold-tint p-5">
          <p className="dk-overline">আজকের বিষয়</p>
          <p className="mt-2 font-display text-[1.25rem] font-semibold leading-snug">যে চিঠিটা কখনো পাঠানো হয়নি</p>
          <p className="dk-caption mt-1">{bn(128)} জন লিখেছে</p>
        </div>

        <div className="mt-4 divide-y divide-dk-line">
          {posts.map((p) => (
            <Post key={p.id} post={p} now={s.now} onLike={() => s.likePost(p.id)} />
          ))}
        </div>

        <div className="py-12 text-center">
          <p className="font-display text-[1.125rem]">আজকের আড্ডা এখানেই শেষ।</p>
          <p className="dk-caption mt-1">কাউকে মনে পড়ছে? একটা চিঠি লিখে ফেলুন।</p>
          <Button size="md" variant="secondary" className="mt-5" onClick={() => nav.push({ name: "compose" })}>
            চিঠি লিখুন
          </Button>
        </div>
      </div>
    </div>
  );
}

function Post({ post, now, onLike }: { post: AddaPost; now: number; onLike: () => void }) {
  const toast = useToast();
  return (
    <article className="py-6">
      <header className="flex items-center gap-3">
        <Avatar person={post.author} size={36} />
        <div className="flex-1">
          <p className="font-display text-[0.9375rem] font-medium">{post.author.name}</p>
          <p className="dk-caption">
            {KIND_LABEL[post.kind]} · {timeAgo(post.at, now)}
          </p>
        </div>
      </header>
      <p className={cx("mt-4", post.kind === "question" ? "font-display text-[1.375rem] font-semibold leading-snug" : "dk-body text-[1rem]")}>{post.text}</p>
      {post.photo && (
        <div className="mt-4">
          <ImageCard hueA={post.photo.hueA} hueB={post.photo.hueB} caption={post.photo.caption} />
        </div>
      )}
      <footer className="-ml-2 mt-3 flex items-center gap-1 text-dk-ink-2">
        <motion.button whileTap={{ scale: 0.88 }} onClick={onLike} aria-pressed={post.liked} className={cx("flex h-10 items-center gap-1.5 rounded-full px-2", post.liked && "text-dk-error")}>
          <Heart className="h-[18px] w-[18px]" fill={post.liked ? "currentColor" : "none"} />
          <span className="dk-num text-[0.8125rem]">{post.likes}</span>
        </motion.button>
        <button className="flex h-10 items-center gap-1.5 rounded-full px-2" aria-label="মন্তব্য">
          <MessageCircle className="h-[18px] w-[18px]" />
          <span className="dk-num text-[0.8125rem]">{post.comments}</span>
        </button>
        <button className="ml-auto flex h-10 w-10 items-center justify-center rounded-full" aria-label="শেয়ার" onClick={() => toast({ text: "লিংক কপি হয়েছে" })}>
          <Share2 className="h-[18px] w-[18px]" />
        </button>
      </footer>
    </article>
  );
}
