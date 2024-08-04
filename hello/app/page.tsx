'use client';

import { Box, Flex, Highlight, keyframes, HStack, Text, IconButton, Link, useColorMode, useColorModeValue, Input } from "@chakra-ui/react";
import { SocialGithub, SocialInstagram, SocialLinkedin } from "@chakra-icons/simple-line-icons";
import { SunIcon, RepeatIcon } from "@chakra-ui/icons";
import { FC, useCallback, useEffect, useState } from "react";

const moveText = keyframes`
  7% {margin-top: 0;}
  14% {margin-top: 0;}
  21% {margin-top: -4.5rem;}
  28% {margin-top: -4.5rem;}
  35% {margin-top: -9rem;}
  42% {margin-top: -9rem;}
  49% {margin-top: -13.5rem;}
  56% {margin-top: -13.5rem;}
  63% {margin-top: -9rem;}
  70% {margin-top: -9rem;}
  77% {margin-top: -4.5rem;}
  84% {margin-top: -4.5rem;}
  91% {margin-top: 0;}
  100% {margin-top: 0;}
`;

type PressableProps = { text: string, id: number, size: number, refreshChannel: any };

const PressableText = (props: PressableProps) => {
  return (
    
      props.text.split(' ').map((word, i) => {
        return (
          <Text key={i}>
            <PressableWord text={word} id={props.id + i} size={props.size} refreshChannel={props.refreshChannel}/>
          </Text>
        )
      })
  )
}

const getWordId = (id: string) => {
  return `pw-${id}`;
}

const PressableWord = (props: PressableProps) => {
  const [state, setState] = useState(() => {
    const defaultValue = props.text.split('').map(_ => false);
    if (typeof window === 'undefined') return defaultValue;
    const saved = localStorage.getItem(getWordId(props.id.toString()));

    let parsed = null;
    if (saved) {
      try {
        parsed = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    
    return parsed ? parsed : defaultValue;
  });

  useEffect(() => {
    const stateString = JSON.stringify(state);
    localStorage.setItem(getWordId(props.id.toString()), stateString);
  }, [state]);

  useEffect(() => {
    if (props.refreshChannel) {
      setState(props.text.split('').map(_ => false));
    }
  }, [props.refreshChannel]);

  function mulberry32(a: number) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
  }
  const getRandom = mulberry32(0xdeadbeef + props.id);

  const spans = props.text.split('').map((char, i) => {
    const checked = state[i];
    const handleCheckboxChange = () => {
      const newState = [...state];
      newState[i] = !newState[i];
      setState(newState);
    }
    const animationDelay = `${getRandom() * 2}s`;
    return (
      <Text as="span" key={i}>
        <input style={{
          "height": `${props.size}rem`,
          "width": `${props.size}rem`,
          "marginTop": `${props.size / 2}rem`,
        }} checked={checked} onChange={handleCheckboxChange} className="pressableLetter" type="checkbox" />
        <span style={{ "animationDelay": animationDelay }}>{char}</span>
      </Text>
    )
  });

  return (
    <>{spans}</>
  )
}


const IM = (props: { text: string, isFirst?: boolean, bg: string }) => {
  const textAnimation = `${moveText} 15s 1s infinite`;
  return (
    <Box animation={props.isFirst ? textAnimation : undefined}>
      <Highlight query={props.text} styles={{ px: '2', py: '2', bg: props.bg, rounded: '2' }}>
        {props.text}
      </Highlight>
    </Box>
  )
};


export default function Home() {
  const { colorMode, toggleColorMode } = useColorMode();
  const [refreshChannel, setRefreshChannel] = useState(0);

  const handleRepeat = () => {
    setRefreshChannel(refreshChannel + 1);
  }

  const textShadowColor = useColorModeValue('rgba(0,0,0,.3)', 'rgba(255,255,255,.3)');
  const textShadow = `0 0 20px ${textShadowColor}, 0 0 2px ${textShadowColor}`;
  const noTextShadow = '0 0 0px';

  return (
    <Flex flexDir="column" className="main" h="100%" justifyContent="space-between">
      <Flex justifyContent="flex-end" h="16">
        <HStack spacing="2" mr={["2", "8"]}>
          <IconButton size="sm" colorScheme="gray" aria-label="Refresh" icon={<RepeatIcon/>} onClick={handleRepeat}></IconButton>
          <IconButton size="sm" colorScheme="gray" aria-label="Toggle dark mode" icon={<SunIcon />} onClick={toggleColorMode} />
        </HStack>
      </Flex>
      <Flex flexDir="column" justifyContent="center" alignItems="center" gap="20">
        <Flex fontSize={["4xl", "5xl"]} gap="4" wrap="wrap" justifyContent="center" textAlign="center" textShadow={textShadow}>
          <Box mr={["0", "1rem"]}>
            <PressableWord text="hello" id={1} size={2.3} refreshChannel={refreshChannel}/>
            <span> </span>
            <Text as="span" textShadow={noTextShadow}>👋</Text>
            <span> </span>
            <PressableWord text="i'm" id={2} size={2.3} refreshChannel={refreshChannel}/>
          </Box>
          <Flex fontSize="5xl" flexDir="column" overflow="hidden" h="4.5rem" alignItems={["center", "flex-start"]}>
            <IM text="😼Lev" bg="orange.100" isFirst />
            <IM text="💻Web3 dev" bg="red.100" />
            <IM text="😎Hedonist" bg="blue.100" />
            <IM text="✨Dreamer" bg="green.100" />
          </Flex>
        </Flex>
        <Flex gap={3} wrap="wrap" justifyContent="center">
            <PressableText text="press a letter and customize this site!" id={300} size={1.5} refreshChannel={refreshChannel}/>
        </Flex>
      </Flex>
      <Flex justifyContent="center" alignItems="center" marginBottom="1rem">
        <HStack spacing="6">
          <Text><PressableWord text="links:" id={4} size={1} refreshChannel={refreshChannel} /></Text>
          <Link isExternal href="https://github.com/sevenzing" aria-label="github"><SocialGithub boxSize="20px" /></Link>
          <Link isExternal href="https://instagram.com/llevchiks/" aria-label="instagram"><SocialInstagram boxSize="20px" /></Link>
          <Link isExternal href="https://linkedin.com/in/lymarenkolev/" aria-label="linkedin"><SocialLinkedin boxSize="20px" /></Link>
        </HStack>
      </Flex>
    </Flex>
  );
}
