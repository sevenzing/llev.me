'use client'

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import LockedCardContent from './locked-card';
import { Center, Spinner, Text } from "@chakra-ui/react"
import { notFound } from 'next/navigation';
import CardSkeleton from './card-skeleton';


type Gift = {
  title: string;
  description: string;
  acquire_url: string;
  background_image: string;
  shining_color: string;
};

type GiftCardProps = {
  slug: string;
};
  

export default function GiftCard({ slug }: GiftCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [code, setCode] = useState('');
    const [gift, setGift] = useState<Gift | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [getInfo, setGetInfo] = useState<any | null>(null);
    const exists = getInfo?.exists;
    const preview_content = getInfo?.preview_content;
    const onSuccessCode = (gift: Gift) => {
      setGift(gift)
    }

    useEffect(() => {
      axios.get(`/api/cards/${slug}`)
      .then((res) => {
        setLoading(false)
        setGetInfo(res.data)
      })
    }, [])

    if (loading) {
      return <Spinner />
    }

    if (!exists) {
      notFound()
      return null
    }

    if (!gift) {
      return (
        <CardSkeleton frontChildren={
          <LockedCardContent slug={slug} preview_content={preview_content} onSuccess={onSuccessCode} />
        }
        backChildren={
          <Center dir="row"><Text>nothing here yet</Text></Center>
        }/>
      )
    }
  
    return (
      <motion.div
        className="gift-card"
        style={{
          width: '300px',
          height: '500px',
          borderRadius: '15px',
          overflow: 'hidden',
          perspective: '1000px',
          border: '2px solid #ccc',
        }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        Hello
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          style={{
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            position: 'relative',
          }}
        >
          World
        </motion.div>
      </motion.div>
    );
  }
  