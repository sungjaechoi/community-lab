import type { Metadata } from "next";
import { PostEditor } from "@/components/posts/post-editor";

export const metadata: Metadata = { title: "이야기 다듬기" };
export default async function EditPostPage({ params }: PageProps<"/posts/[id]/edit">) {
  const { id } = await params;
  return <PostEditor id={id} />;
}
