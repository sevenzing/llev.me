"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import LockedCardContent from "./locked-card";
import {
  Center,
  Flex,
  Heading,
  Image,
  Link,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { notFound } from "next/navigation";
import CardSkeleton from "./card-skeleton";
import { LuExternalLink } from "react-icons/lu";

type Gift = {
  title: string;
  title_size: string;
  description: string;
  description_size: string;
  image: string;
  gift_content: GiftContent;
};

type GiftContent =
  | {
      type: "urls";
      urls: {
        url: string;
        title: string;
      }[];
    }
  | {
      type: "text";
      text: string;
    };

type GiftCardProps = {
  slug: string;
};

export default function GiftCard({ slug }: GiftCardProps) {
  const [gift, setGift] = useState<Gift | null>(null);
  const [loading, setLoading] = useState(true);
  const [briefInfo, setBriefInfo] = useState<any | null>(null);
  const exists = briefInfo?.exists;
  const preview_content = briefInfo?.preview_content;
  const onSuccessCode = (gift: Gift) => {
    setGift(gift);
  };

  useEffect(() => {
    axios.get(`/api/cards/${slug}`).then((res) => {
      setLoading(false);
      setBriefInfo(res.data);
    });
  }, [slug]);

  if (loading) {
    return <Spinner />;
  }

  if (!exists) {
    notFound();
    return null;
  }

  if (!gift) {
    return (
      <CardSkeleton
        frontChildren={
          <LockedCardContent
            slug={slug}
            preview_content={preview_content}
            onSuccess={onSuccessCode}
          />
        }
        backChildren={
          <Center dir="row">
            <Text>🔒 nothing here yet 🔒</Text>
          </Center>
        }
      />
    );
  }

  return (
    <CardSkeleton
      frontChildren={<FrontContent gift={gift} />}
      backChildren={<BackContent gift={gift} />}
    />
  );
}

const FrontContent = ({ gift }: { gift: Gift }) => {
  const image = (
    <Image src={gift.image} alt={gift.title} height={150} rounded="1rem" />
  );
  const titleSize = (gift.title_size as any) || "3xl";
  const descriptionSize = (gift.description_size as any) || "md";

  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="space-evenly"
      mx={6}
      textAlign="center"
    >
      <Heading size={titleSize}>{gift.title}</Heading>
      {image}
      <Text whiteSpace="pre-wrap" fontSize={descriptionSize}>
        {gift.description}
      </Text>
    </Flex>
  );
};

const BackContent = ({ gift }: { gift: Gift }) => {
  if (gift.gift_content.type === "urls") {
    return (
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="space-evenly"
      >
        <VStack justifyContent="center" mx={4}>
          {gift.gift_content.urls.map((url) => (
            <Link
              key={url.url}
              href={url.url}
              target="_blank"
              colorPalette="purple"
            >
              {url.title}
              <LuExternalLink />
            </Link>
          ))}
        </VStack>
      </Flex>
    );
  }
};
