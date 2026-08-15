import { AchievementSeed } from "./types";

export const CHAIN_HERO_TEXTS: string[] = [
  "This is a blockchain",
  "Like a chain of events",
  "Like a my history",
  "Yep I like blockchains",
] as const;



export const ACHIEVEMENTS: AchievementSeed[] = [
  { number: 0, date: "2001 · jul", title: "genesis", content: "I was born" },
  {
    number: 1, date: "2018 · oct", title: "first smart contract",
    content: "I wrote my first smart contract and deployed it with web3.py. It was awesome"
  },
  { number: 2, date: "2019 · mar", title: "fintech", 
    content: "I won the russian fintech ethereum olympiad, NTI. worked with ethereum a lot during that" },
  { number: 3, date: "2019 · sep", title: "innopolis", 
    content: "I started studying at innopolis university. long but interesting experience" },
  { number: 4, date: "2021 · mar", title: "yandex", 
    content: "I started working at yandex, building infra in python. worked with a lot of cool people and projects there" },
  { number: 5, date: "2022 · mar", title: "blockscout", 
    content: "I started working at blockscout, building the open source explorer in rust." },
  { number: 6, date: "2022 · jul", title: "hack-a-ton", content: "My team and I won the first hack-a-ton by telegram. We used TONPayments to pay for RPC calls." },
  { number: 7, date: "2023 · sep", title: "innopolis", content: "I graduated from innopolis!!!" },
  { number: 8, date: "2026 · mar", title: "namehash", content: "I started working at namehash, building ensnode in typescript. I loved ENS. RIP" },
];

const MAGIC_NUMBER = 54449;

export function initialNonceFor(seed: AchievementSeed): number {
  if (seed.number === 0) return MAGIC_NUMBER;
  return 0;
}
