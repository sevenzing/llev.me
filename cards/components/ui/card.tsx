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
import { AnimatePresence, motion } from "framer-motion";

const ANIMATION_DURATION = 0.8;

type Gift = {
  title: string;
  title_size: string | null;
  title_color: string | null;
  description: string;
  description_size: string | null;
  description_color: string | null;
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
      colorPalette: string | null;
    }
  | {
      type: "text";
      text: string;
      color: string | null;
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

  let front = undefined;
  let back = undefined;

  if (gift) {
    front = <FrontContent gift={gift} />;
    back = <BackContent gift={gift} />;
  } else {
    front = (
      <LockedCardContent
        slug={slug}
        preview_content={preview_content}
        onSuccess={onSuccessCode}
      />
    );
    back = (
      <Center dir="row">
        {" "}
        <Text>🔒 nothing here yet 🔒</Text>{" "}
      </Center>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        key="card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: ANIMATION_DURATION }}
      >
        <CardSkeleton frontChildren={front} backChildren={back} />
      </motion.div>
    </AnimatePresence>
  );
}

const MotionFlex = motion(Flex);

const FrontContent = ({ gift }: { gift: Gift }) => {
  const image = (
    <Image src={gift.image} alt={gift.title} height={150} rounded="1rem" />
  );
  const titleSize = (gift.title_size as any) || "3xl";
  const descriptionSize = (gift.description_size as any) || "md";
  const titleColor = (gift.title_color as any) || undefined;
  const descriptionColor = (gift.description_color as any) || undefined;

  return (
    <AnimatePresence>
      <MotionFlex
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: ANIMATION_DURATION, ease: "easeInOut" }}
        direction="column"
        alignItems="center"
        justifyContent="space-evenly"
        mx={6}
        textAlign="center"
        height="100%"
      >
        <Heading color={titleColor} size={titleSize}>
          {gift.title}
        </Heading>
        {image}
        <Text
          whiteSpace="pre-wrap"
          color={descriptionColor}
          fontSize={descriptionSize}
        >
          {gift.description}
        </Text>
      </MotionFlex>
    </AnimatePresence>
  );
};

const BackContent = ({ gift }: { gift: Gift }) => {
  let content = null;
  if (gift.gift_content.type === "urls") {
    const colorPalette = (gift.gift_content.colorPalette as any) || undefined;
    content =
          gift.gift_content.urls.map((url) => (
            <Link
              key={url.url}
              href={url.url}
              target="_blank"
              color={colorPalette}
            >
              {url.title}
              <LuExternalLink />
            </Link>
          ));
  }
  else if (gift.gift_content.type === "text") {
    const colorPalette = gift.gift_content.color || 'pink.400';
    content = <Flex textAlign="center">
      <Text color={colorPalette}>{gift.gift_content.text}</Text>
    </Flex>;
  }
  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="space-evenly"
    >
      <VStack justifyContent="center" mx={4}>
        {content}
      </VStack>
    </Flex>
  );
};
