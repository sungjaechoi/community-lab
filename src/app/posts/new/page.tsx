import type { Metadata } from "next";
import { PostEditor } from "@/components/posts/post-editor";

export const metadata: Metadata = { title: "새 이야기 쓰기" };
export default function NewPostPage() { return <PostEditor />; }
