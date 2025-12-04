export const translations = {
    en: {
        // Header
        title: "Blockchain Interactive",
        nav: {
            hashing: "Hashing",
            block: "Block",
            chain: "Chain",
            network: "Network",
        },

        // Hero
        hero: {
            title: "Understand Blockchain",
            subtitle: "by touching it.",
            description: "Don't just read about how it works. Break it, fix it, and see the data flow in real-time.",
        },

        // Section 1: Hashing
        hashing: {
            title: "The Fingerprint",
            description: "At the core of blockchain is the Hash. Think of it as a digital fingerprint. If you change even a single comma in the data, the fingerprint changes completely.",
            inputLabel: "Data Input",
            outputLabel: "Hash Output (256-bit)",
            placeholder: "Type something here...",
            emptyState: "Start typing...",
        },

        // Section 2: Block
        block: {
            title: "The Container",
            description: "A Block is just a container for data. But to make it 'official', we need to sign it. This is called Mining. We look for a special number (Nonce) that makes the block's hash start with four zeros.",
            nonce: "Nonce",
            data: "Data",
            prevHash: "Prev Hash",
            hash: "Hash",
            mine: "Mine",
            mining: "Mining...",
            signed: "Block Signed",
            blockNumber: "Block #",
            dataPlaceholder: "Transaction data...",
        },

        // Section 3: Chain
        chain: {
            title: "The Chain",
            description: "Blocks are linked together. Each block contains the fingerprint of the previous one. If you go back and change Block 1, the fingerprint changes, breaking the link to Block 2. The whole chain turns red.",
        },

        // Section 4: Network
        network: {
            title: "The Network",
            description: "A blockchain isn't stored in one place. It's distributed across thousands of computers (nodes). They gossip to share new blocks. If one node tries to cheat, the others reject it.",
            clickNode: "Click a node to broadcast",
        },
    },

    ru: {
        // Header
        title: "Интерактивный Блокчейн",
        nav: {
            hashing: "Хеширование",
            block: "Блок",
            chain: "Цепь",
            network: "Сеть",
        },

        // Hero
        hero: {
            title: "Поймите блокчейн",
            subtitle: "прикоснувшись к нему.",
            description: "Не просто читайте о том, как это работает. Сломайте, исправьте и посмотрите, как данные движутся в реальном времени.",
        },

        // Section 1: Hashing
        hashing: {
            title: "Цифровой отпечаток",
            description: "В основе блокчейна лежит Хеш. Думайте о нём как о цифровом отпечатке пальца. Если вы измените хотя бы одну запятую в данных, отпечаток полностью изменится.",
            inputLabel: "Ввод данных",
            outputLabel: "Хеш (256 бит)",
            placeholder: "Введите что-нибудь...",
            emptyState: "Начните печатать...",
        },

        // Section 2: Block
        block: {
            title: "Контейнер",
            description: "Блок — это просто контейнер для данных. Но чтобы сделать его 'официальным', нам нужно его подписать. Это называется Майнинг. Мы ищем специальное число (Nonce), которое делает хеш блока начинающимся с четырёх нулей.",
            nonce: "Nonce",
            data: "Данные",
            prevHash: "Пред. хеш",
            hash: "Хеш",
            mine: "Майнить",
            mining: "Майнинг...",
            signed: "Блок подписан",
            blockNumber: "Блок №",
            dataPlaceholder: "Данные транзакции...",
        },

        // Section 3: Chain
        chain: {
            title: "Цепь",
            description: "Блоки связаны друг с другом. Каждый блок содержит отпечаток предыдущего. Если вы вернётесь и измените Блок 1, отпечаток изменится, разорвав связь с Блоком 2. Вся цепь станет красной.",
        },

        // Section 4: Network
        network: {
            title: "Сеть",
            description: "Блокчейн не хранится в одном месте. Он распределён по тысячам компьютеров (узлов). Они обмениваются информацией, чтобы делиться новыми блоками. Если один узел попытается обмануть, остальные отклонят это.",
            clickNode: "Нажмите на узел для трансляции",
        },
    },
} as const;

export type Language = 'en' | 'ru';

// Define the shape once
type TranslationStructure = {
    title: string;
    nav: {
        hashing: string;
        block: string;
        chain: string;
        network: string;
    };
    hero: {
        title: string;
        subtitle: string;
        description: string;
    };
    hashing: {
        title: string;
        description: string;
        inputLabel: string;
        outputLabel: string;
        placeholder: string;
        emptyState: string;
    };
    block: {
        title: string;
        description: string;
        nonce: string;
        data: string;
        prevHash: string;
        hash: string;
        mine: string;
        mining: string;
        signed: string;
        blockNumber: string;
        dataPlaceholder: string;
    };
    chain: {
        title: string;
        description: string;
    };
    network: {
        title: string;
        description: string;
        clickNode: string;
    };
};

export type TranslationKeys = TranslationStructure;
