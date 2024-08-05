import { decodeSearchState, StateIsEqual, StateIsSubset } from "@/utils/state"

type AchievementCard = {
    id: number,
    slug: string,
    title: string,
    description: string,
    emoji: string,
    bg: string,
    textProps?: any,
}

type Achievement = {
    card: AchievementCard,
    state: any,
    compareStateType: "subset" | "equal" | "at_least_something"
}

const achievementsConfig: Achievement[] = [
    {
        state: {},
        card: {
            id: 0,
            slug: "first.exe",
            title: "THE FIRST",
            description: "make your first selection",
            emoji: "🎉",
            bg: "blue.200",
        },
        compareStateType: "at_least_something"
    },
    {
        state: { '2': 1, '4': 1, '5': 1, '6': 1, '7': 1 },
        compareStateType: "equal",
        card: {
            id: 1,
            slug: "emoji.exe",
            title: "EMOJI LOVER",
            description: "select all emojis",
            emoji: "😎",
            bg: "orange.200",
        }
    },
    {
        state: { '1': 31 },
        compareStateType: "equal",
        card: {
            id: 2,
            slug: "hello.exe",
            title: "HELLO WORLD",
            description: "select HELLO word",
            emoji: "🌍",
            bg: "green.200",
        }
    },
    {
        state: { '5': 16 },
        compareStateType: "equal",
        card: {
            id: 3,
            slug: "digits.exe",
            title: "DIGITS",
            description: "select all digits",
            emoji: "🔢",
            bg: "red.200",
        }
    },
    {
        state: { '4': 2, '5': 2, '6': 2, '7': 2 },
        compareStateType: "equal",
        card: {
            id: 4,
            slug: "???.exe",
            title: "STRANGE",
            description: "select all strange letters",
            emoji: "🤔",
            bg: "purple.200",
        }
    },
    {
        state: { '10': 31 },
        compareStateType: "equal",
        card: {
            id: 5,
            slug: "links.exe",
            title: "LINKS",
            description: "wow, you found links!",
            emoji: "🔗",
            bg: "teal.200",
        }
    }
];


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const s = searchParams.get('s')
    const state = s ? decodeSearchState(s) : {}

    console.log(state)

    const achievements = achievementsConfig.filter((achievement) => {
        if (achievement.compareStateType === "equal") {
            return StateIsEqual(state, achievement.state)
        } else if (achievement.compareStateType === "subset") {
            return StateIsSubset(state, achievement.state)
        } else if (achievement.compareStateType === "at_least_something") {
            for (const id of Object.keys(state)) {
                if (state[id] !== 0) {
                    return true
                }
            }
        }

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



