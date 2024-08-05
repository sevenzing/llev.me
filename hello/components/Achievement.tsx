import { Card, CardBody, CardHeader, CloseButton, Divider, Flex, Heading, Stack, Text, useColorModeValue } from "@chakra-ui/react"

export type AchievementProps = {
    id: number,
    slug: string,
    title: string,
    description: string,
    bg: string,
    emoji: string,
    textProps?: any,
    key?: number,
    onAchievementClose: (id: number) => void,
}

export const Achievement = (props: AchievementProps) => {

    const shadow = useColorModeValue('0px 0px 6px white', '0px 0px 6px gray');
    const textProps = props.textProps || {};
    return (
        <Card 
            key={props.key} 
            bg={props.bg}
            size="sm" 
            w={{ base: '8rem', sm: '10rem' }}
            overflow={{ base: 'hidden', sm: 'visible' }}
            textShadow={shadow} fontSize={10}
        >
            <Flex justifyContent="space-between" alignItems="center">
                <Text mx={2}>{props.slug}</Text>
                <CloseButton size="sm" onClick={() => props.onAchievementClose(props.id)} />
            </Flex>
            <Divider/>
            <Flex alignItems="center" flexDir={{ base: 'column', sm: 'row' }}>
                <Text mx={4} fontSize="xxx-large">{props.emoji}</Text>
                <Stack margin={{base: "0 0 4px 0", sm: "4px 0 4px 0"}} gap={0} {...textProps}  textAlign={{base: "center", sm: "left"}}>
                    <Heading size="sm">{props.title}</Heading>
                    <Text>{props.description}</Text>
                </Stack>
            </Flex>
            
        </Card>
    )
}


export const Achievements = (props: { achievements: AchievementProps[], onAchievementClose: (id: number) => void }) => {
    const sorted = props.achievements.sort((a, b) => a.id - b.id);
    return (
        <Flex wrap="wrap" gap={4} direction="row" justifyContent="center" maxW="800px" mx={{base: "2rem", sm: "0rem"}}>
            {sorted.map((achievement, i) => (
                <Achievement {...achievement} onAchievementClose={props.onAchievementClose} key={i} />
            ))}
        </Flex>
    )
}