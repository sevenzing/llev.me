'use client';

import { AbsoluteCenter, Box, Center, Flex, Highlight, keyframes, HStack, Text, IconButton, Link, useColorMode, Button, useColorModeValue } from "@chakra-ui/react";
import { SocialGithub, SocialInstagram,  SocialLinkedin} from "@chakra-icons/simple-line-icons";
import { SunIcon } from "@chakra-ui/icons";

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


const TextPressable = (props: {text: string}) => {
  return props.text.split('').map((char, i) => {
    return <Text as="span" key={i} ><input className="pressableLetter" type="checkbox"/><span>{char}</span></Text>
  })
}


const IM = (props: {text: string, isFirst?: boolean, bg: string}) => {
  const textAnimation = `${moveText} 15s 1s infinite`;
  return (
    <Box animation={props.isFirst ? textAnimation : undefined}>
      <Highlight query={props.text} styles={{ px: '2', py: '2', bg: props.bg, rounded: '0' }}>
          {props.text}
      </Highlight>
    </Box>
  )
};


export default function Home() {
  const { colorMode, toggleColorMode } = useColorMode();

  const textShadowColor = useColorModeValue('rgba(0,0,0,.3)', 'rgba(255,255,255,.3)');
  const textShadow = `0 0 20px ${textShadowColor}, 0 0 2px ${textShadowColor}`;
  const noTextShadow = '0 0 0px';

  return (
    <Flex flexDir="column" h="100vh" className="main">
      <Flex justifyContent="flex-end" h="16">
        <HStack spacing="2" mr={["2", "8"]}>
          <IconButton size="sm" colorScheme="gray" aria-label="Toggle dark mode" icon={<SunIcon/>} onClick={toggleColorMode}/>
        </HStack>
      </Flex>
      <Flex flexDir="column" justifyContent="center" height="100%">
        <Flex fontSize={["4xl", "5xl"]} gap="4" wrap="wrap" justifyContent="center" textAlign="center" textShadow={textShadow}>
            <Box mr={["0","1rem"]}>
              <TextPressable text="hello"/>
              <span> </span>
              <Text as="span" textShadow={noTextShadow}>👋</Text>
              <span> </span>
              <TextPressable text="i'm"/>
            </Box>
            <Flex fontSize="5xl" flexDir="column" overflow="hidden" h="4.5rem" alignItems={["center", "flex-start"]}>
              <IM text="😼Lev" bg="orange.100" isFirst/>
              <IM text="💻Web3 dev" bg="red.100"/>
              <IM text="😎Hedonist" bg="blue.100"/>
              <IM text="✨Dreamer" bg="green.100"/>
            </Flex>
        </Flex>
      </Flex>
      <Flex justifyContent="center" alignItems="center" marginBottom="1rem">
        <HStack spacing="6">
          <Text fontSize="sm">links:</Text>
          <Link isExternal href="https://github.com/sevenzing" aria-label="github"><SocialGithub boxSize="20px"/></Link>
          <Link isExternal href="https://instagram.com/llevchiks/" aria-label="instagram"><SocialInstagram boxSize="20px"/></Link>
          <Link isExternal href="https://linkedin.com/in/lymarenkolev/" aria-label="linkedin"><SocialLinkedin boxSize="20px"/></Link>
        </HStack>
      </Flex>
    </Flex>
  );
}
