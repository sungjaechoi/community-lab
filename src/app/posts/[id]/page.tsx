import type { Metadata } from "next";
import { PostDetail } from "@/components/posts/post-detail";

export const metadata: Metadata = { title: "이야기" };
export default async function PostPage({ params }: PageProps<"/posts/[id]">) {
  const { id } = await params;
  return <PostDetail key={id} id={id} />;
}
