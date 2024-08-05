import { decodeSearchState, isStateEmpty, StateIsEqual, StateIsSubset } from "@/utils/state"

export type AchievementCard = {
    id: number,
    slug: string,
    title: string,
    description: string,
    emoji: string,
    bg: string,
    textProps?: any,
}

type AchievementForState = {
    card: AchievementCard,
    state: any,
    compareStateType: "subset" | "equal" | "atLeastSomething" | "setIsNotEmpty",
}

type AchievementForAction = {
    card: AchievementCard,
    action: "refresh" | "changeColorMode" | "clickSocial",
}

type Achievement = AchievementForState | AchievementForAction

const stateAchievementsConfig: Achievement[] = [
    {
        state: {},
        card: {
            id: 0,
            slug: "first",
            title: "THE FIRST",
            description: "make your first selection",
            emoji: "🎉",
            bg: "blue.200",
        },
        compareStateType: "setIsNotEmpty"
    },
    {
        state: { '2': 1, '4': 1, '5': 1, '6': 1, '7': 1 },
        compareStateType: "equal",
        card: {
            id: 1,
            slug: "emoji",
            title: "EMOJI LOVER",
            description: "select all emojis and only them",
            emoji: "😎",
            bg: "orange.200",
        }
    },
    {
        state: { '1': 31 },
        compareStateType: "equal",
        card: {
            id: 2,
            slug: "hello",
            title: "HELLO WORLD",
            description: "select HELLO word and only it",
            emoji: "🌍",
            bg: "green.200",
        }
    },
    {
        state: { '5': 16 },
        compareStateType: "equal",
        card: {
            id: 3,
            slug: "digits",
            title: "DIGITS",
            description: "select all digits and only them",
            emoji: "🔢",
            bg: "red.200",
        }
    },
    {
        state: { '4': 2, '5': 2, '6': 2, '7': 2 },
        compareStateType: "equal",
        card: {
            id: 4,
            slug: "???",
            title: "STRANGE",
            description: "select all strange letters and only them",
            emoji: "🤔",
            bg: "purple.200",
        }
    },
    {
        state: {'10': undefined},
        compareStateType: "atLeastSomething",
        card: {
            id: 5,
            slug: "links",
            title: "LINKS",
            description: "wow! even 'links' is clickable",
            emoji: "🔗",
            bg: "teal.200",
        }
    },
    {
        state: {'1': 31,'2': 1,'3': 14,'4': 15,'5': 479,'6': 511,'7': 255,'8': 245599,'9': 1031679,'10': 63},
        compareStateType: "subset",
        card: {
            id: 6,
            slug: "all",
            title: "SQL MASTER",
            description: "select * from letters",
            emoji: "🎯",
            bg: "red.400",
        },
    },
    {
        action: "refresh",
        card: {
            id: 7,
            slug: "refresh",
            title: "REFRESH",
            description: "press the refresh button once",
            emoji: "🔄",
            bg: "purple.400",
        }
    },
    {
        action: "changeColorMode",
        card: {
            id: 8,
            slug: "color",
            title: "MY EYES!!!",
            description: "switch to light mode",
            emoji: "🌞",
            bg: "whiteAlpha.400",
        }
    },
    {
        action: "clickSocial",
        card: {
            id: 9,
            slug: "social",
            title: "FOLLOW ME",
            description: "click on any social link",
            emoji: "👍",
            bg: "blue.400",
        }
    }
];


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const s = searchParams.get('s')
    const state = s ? decodeSearchState(s) : {}
    const action = searchParams.get('a')

    const achievements = stateAchievementsConfig.filter((achievement) => {
        if ("action" in achievement) {
            return achievement.action === action
        }

        if (achievement.compareStateType === "equal") {
            return StateIsEqual(state, achievement.state)
        } else if (achievement.compareStateType === "subset") {
            return StateIsSubset(state, achievement.state)
        } else if (achievement.compareStateType === "atLeastSomething") {
            for (const key in achievement.state) {
                if ((state[key] || 0) == 0) {
                    return false
                }
            }
            return true
        } else if (achievement.compareStateType === "setIsNotEmpty") {
            return !isStateEmpty(state)
        }

        return false
    });

    if (achievements.length > 0) {
        return Response.json({
            "achievements": achievements.map((achievement) => ({
                ...achievement.card,
            }))
        })
    }

    return Response.json({ state })
}



