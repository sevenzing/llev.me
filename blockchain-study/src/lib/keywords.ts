export interface KeywordTarget {
    scroll: string;
    highlight: string;
}

export const KEYWORDS: Record<string, KeywordTarget> = {
    // English
    "data": { scroll: "data", highlight: "Everything starts with Data" },
    "hash": { scroll: "hashing", highlight: "digital fingerprint of Data" },
    "prev hash": { scroll: "chain", highlight: "Prev Hash" },
    "nonce": { scroll: "mining", highlight: "special number a Nonce" },
    "proof of work": { scroll: "mining", highlight: "Proof of Work" },
    "mining": { scroll: "mining", highlight: "process Proof of Work or Mining" },
    "miner": { scroll: "mempool", highlight: "Miners look at this queue" },
    "block": { scroll: "block", highlight: "Block is just a container" },
    "chain": { scroll: "chain", highlight: "connect blocks into the Chain" },
    "blockchain": { scroll: "chain", highlight: "Chain or Blockchain" },
    "nodes": { scroll: "network", highlight: "computers, we call them Nodes" },
    "node": { scroll: "network", highlight: "computers, we call them Nodes" },
    "wallet": { scroll: "keys", highlight: "you need a Wallet" },
    "private key": { scroll: "keys", highlight: "Private Key and Public Key" },
    "public key": { scroll: "keys", highlight: "Private Key and Public Key" },
    "message": { scroll: "keys", highlight: "we also call it Message" },
    "signature": { scroll: "keys", highlight: "providing Signature as result" },
    "transaction hash": { scroll: "transactions", highlight: "calculate the Transaction Hash" },
    "transactions": { scroll: "transactions", highlight: "official, the sender must sign" },
    "mempool": { scroll: "mempool", highlight: "area called the Mempool" },
    "fee": { scroll: "mempool", highlight: "usually, they sort them by Fee" },
    "network": { scroll: "network", highlight: "The Network" },

    // Russian
    "данных": { scroll: "data", highlight: "Всё начинается с Данных" },
    "данные": { scroll: "data", highlight: "Всё начинается с Данных" },
    "хеш": { scroll: "hashing", highlight: "цифровом отпечатке пальца" },
    "майнинг": { scroll: "mining", highlight: "Цель: блок, хеш которого" },
    "блок": { scroll: "block", highlight: "Блок — это просто контейнер" },
    "цепь": { scroll: "chain", highlight: "связаны друг с другом" },
    "узлов": { scroll: "network", highlight: "тысячам компьютеров (Узлов)" },
    "кошелек": { scroll: "keys", highlight: "вам нужен Кошелек" },
    "приватный ключ": { scroll: "keys", highlight: "пара ключей: Приватный ключ" },
    "публичный ключ": { scroll: "keys", highlight: "Публичный ключ (для их проверки)" },
    "подпись": { scroll: "keys", highlight: "Подпись — это просто число" },
    "мемпул": { scroll: "mempool", highlight: "листе ожидания — Мемпуле" },
} as const;
