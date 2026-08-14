import { AchievementSeed } from "./types";

export const ACHIEVEMENTS: AchievementSeed[] = [
  { number: "00", date: "2001 · jul", title: "genesis", content: "I was born" },
  {
    number: "01", date: "2018 · oct", title: "first smart contract",
    content: "I wrote my first smart contract and deployed it with web3.py, it was so fun"
  },
  { number: "02", date: "2019 · mar", title: "fintech", 
    content: "I won the russian fintech ethereum olympiad, NTI. worked with ethereum a lot during that" },
  { number: "03", date: "2019 · sep", title: "innopolis", 
    content: "I started studying at innopolis university. long but interesting experience" },
  { number: "04", date: "2021 · mar", title: "yandex", 
    content: "I started working at yandex, building infra in python. worked with a lot of cool people and projects there" },
  { number: "05", date: "2022 · mar", title: "blockscout", 
    content: "I started working at blockscout, building the open source explorer in rust." },
  { number: "06", date: "2022 · jul", title: "hack-a-ton", content: "My team and I won the first hack-a-ton by telegram. We used TONPayments to pay for RPC calls." },
  { number: "07", date: "2023 · sep", title: "innopolis", content: "I graduated from innopolis!!!" },
  { number: "08", date: "2026 · mar", title: "namehash", content: "I started working at namehash, building ensnode in typescript. I loved ENS. RIP" },
];

const MAGIC_NUMBER = 102549;

export function initialNonceFor(seed: AchievementSeed): number {
  if (seed.number === "000") return MAGIC_NUMBER;
  return 0;
}
