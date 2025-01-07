import GiftCard from "@/components/ui/card";
import { AbsoluteCenter } from "@chakra-ui/react";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!slug) {
    return <></>;
  }
  return (
    <AbsoluteCenter>
      <GiftCard slug={slug} />
    </AbsoluteCenter>
  );
}
