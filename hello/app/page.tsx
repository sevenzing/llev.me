'use client';

import { Box, Flex, HStack, Text, IconButton, Link, useColorMode, useColorModeValue, useToast } from "@chakra-ui/react";
import { SocialGithub, SocialInstagram, SocialLinkedin } from "@chakra-icons/simple-line-icons";
import { SunIcon, RepeatIcon } from "@chakra-ui/icons";
import { useCallback, useEffect, useState } from "react";
import { PressableText } from "../components/PressableText";
import { usePathname, useSearchParams } from 'next/navigation'
import { useRouter } from "next/navigation";
import { decodeSearchState, encodeSearchState, isStateEmpty, updateStateWhenCheckboxPressed } from "../utils/state";
import { IM } from "../components/IM";
import { randomBitNumber } from "@/utils/random";
import { Achievements } from "@/components/Achievement";
import { AchievementCard } from "./api/stateInfo/route";


export default function Home() {
    const { colorMode, toggleColorMode } = useColorMode();
    const toast = useToast()
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const searchStateRaw = searchParams.get('s');
    const searchState = searchStateRaw ? decodeSearchState(searchStateRaw) : {};
    const [state, setState] = useState(searchState);
    const [currentStateInfo, setCurrentStateInfo] = useState(undefined as any);
    const [achStorage, setSetAchStorage] = useState(() => {
        if (typeof window === 'undefined') {
            return undefined
        }
        const localData = localStorage.getItem('achStorage');
        return localData ? JSON.parse(localData) : {};
    });

    useEffect(() => {
        localStorage.setItem('achStorage', JSON.stringify(achStorage));
    }, [achStorage]);

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            params.set(name, value)

            return params.toString()
        },
        [searchParams]
    )

    useEffect(() => {
        if (!isStateEmpty(state)) {
            const rawState = encodeSearchState(state);
            router.push(pathname + '?' + createQueryString('s', rawState))
        } else {
            router.push(pathname)
        }
    }, [state]);

    useEffect(() => {
        if (searchStateRaw) {
            fetch(`/api/stateInfo?s=${searchStateRaw}`)
            .then((res) => res.json())
            .then((data) => {
                handleStateInfo(data);
            })
            .catch((err) => {
                console.error(err)
            })
        }
    }, [searchStateRaw]);


    const handleRefreshPressed = () => {
        if (isStateEmpty(state)) {
            let newRandomState = {} as any;
            for (let i = 1; i <= 10; i++) {
                newRandomState[i] = randomBitNumber(32);
            }
            setState(newRandomState);
        } else {
            setState({});
        }
        actionHappend('refresh');
    }

    const handleChangeColorMode = () => {
        toggleColorMode();
        actionHappend('changeColorMode');
    }

    const handleSocialClick = () => {
        actionHappend('clickSocial');
    }

    const actionHappend = (action: string) => {
        fetch(`/api/stateInfo?a=${action}`)
            .then((res) => res.json())
            .then((data) => {
                handleStateInfo(data);
            })
            .catch((err) => {
                console.error(err)})
    }

    const handleStateInfo = (data: any) => {
        if (data.achievements) {
            let newAchStorage = {...achStorage};
            for (const key in data.achievements) {
                if (!(data.achievements[key].id in achStorage)) {
                    handleNewAchievement(data.achievements[key]);
                }
                newAchStorage[data.achievements[key].id] = data.achievements[key]
            }
            setCurrentStateInfo(data.achievements);
            setSetAchStorage(newAchStorage);
        } else {
            setCurrentStateInfo(undefined);
        }
    }

    const handleNewAchievement = (achievement: AchievementCard) => {
        toast({
            title: `${achievement.title}`,
            description: "New achievement unlocked!",
            status: 'success',
            duration: 8000,
            isClosable: true,
            icon: <Text fontSize="x-large">{achievement.emoji}</Text>,
        })
    }

    const onAchievementClose = (id: number) => {
        let newAchStorage = {...achStorage};
        delete newAchStorage[id];
        setSetAchStorage(newAchStorage);
        setState({});
    }

    const onLetterPressed = (id: number, index: number) => {
        const newState = updateStateWhenCheckboxPressed(state, id, index);
        setState(newState);
    }

    const textShadowColor = useColorModeValue('rgba(0,0,0,.3)', 'rgba(255,255,255,.3)');
    const textShadow = `0 0 5px ${textShadowColor}, 0 0 2px ${textShadowColor}`;
    const noTextShadow = '0 0 0px';

    return (
        <Flex flexDir="column" className="main" h="100%" gap={1}>
            <Flex justifyContent="flex-end" h="16">
                <HStack spacing="2" mr={["2", "8"]}>
                    <IconButton size="sm" colorScheme="gray" aria-label="Refresh" icon={<RepeatIcon />} onClick={handleRefreshPressed}></IconButton>
                    <IconButton size="sm" colorScheme="gray" aria-label="Toggle dark mode" icon={<SunIcon />} onClick={handleChangeColorMode} />
                </HStack>
            </Flex>
            <Flex flex={1} flexDir="column" alignItems="center" justifyContent="space-evenly" h="100%">
                <Flex flexDir="column" justifyContent="center" alignItems="center" gap="5">
                    <Flex textShadow={textShadow} fontSize={["4xl", "5xl"]}>
                        <PressableText text="hello " id={1} size={2.3} state={state} onLetterPressed={onLetterPressed} />
                        <Text as="span" textShadow={noTextShadow}>
                            <PressableText text="👋" id={2} size={2.5} checkBoxLeftOffset={0.4} state={state} onLetterPressed={onLetterPressed} />
                        </Text>
                        <PressableText text=" i'm" id={3} size={2.3} state={state} onLetterPressed={onLetterPressed} />
                    </Flex>
                    <Flex fontSize="5xl" flexDir="column" overflow="hidden" h="4rem" alignItems={["center"]} mt={["0.5rem"]}>
                        <IM text="😼Lev" isFirst bg="orange.100" id={4} size={2.3} checkBoxLeftOffset={0.2} checkBoxTopOffset={-0.4} state={state} onLetterPressed={onLetterPressed} zIndex={50} />
                        <IM text="💻Web3 dev" bg="red.100" id={5} size={2.3} checkBoxLeftOffset={0.2} checkBoxTopOffset={-0.4} state={state} onLetterPressed={onLetterPressed} zIndex={50} />
                        <IM text="😎Hedonist" bg="blue.100" id={6} size={2.3} checkBoxLeftOffset={0.2} checkBoxTopOffset={-0.4} state={state} onLetterPressed={onLetterPressed} zIndex={50} />
                        <IM text="✨Dreamer" bg="green.100" id={7} size={2.3} checkBoxLeftOffset={0.2} checkBoxTopOffset={-0.4} state={state} onLetterPressed={onLetterPressed} zIndex={50} />
                    </Flex>
                    <Flex wrap="wrap" justifyContent="center">
                        <Flex><PressableText text="press a letter and " id={8} size={0.8} state={state} onLetterPressed={onLetterPressed} /></Flex>
                        <Flex><PressableText text="customize this site!" id={9} size={0.8} state={state} onLetterPressed={onLetterPressed} /></Flex>
                    </Flex>
                </Flex>
                <Flex p={5} fontFamily="'Inter Variable', sans-serif" overflowY="auto" maxH={500}>
                    {achStorage && <Achievements onAchievementClose={onAchievementClose} achievements={Object.values(achStorage)}/>}
                </Flex>
            </Flex>
            <Flex justifyContent="center" alignItems="center" marginBottom="1rem">
                <HStack spacing="6">
                    <Text><PressableText text="links:" id={10} size={0.8} state={state} onLetterPressed={onLetterPressed} /></Text>
                    <Link isExternal onClick={handleSocialClick} href="https://github.com/sevenzing" aria-label="github"><SocialGithub boxSize="20px" /></Link>
                    <Link isExternal onClick={handleSocialClick} href="https://instagram.com/llevchiks/" aria-label="instagram"><SocialInstagram boxSize="20px" /></Link>
                    <Link isExternal onClick={handleSocialClick} href="https://linkedin.com/in/lymarenkolev/" aria-label="linkedin"><SocialLinkedin boxSize="20px" /></Link>
                </HStack>
            </Flex>
        </Flex>
    );
}

