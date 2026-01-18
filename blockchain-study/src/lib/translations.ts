export const translations = {
    en: {
        // Header
        title: "Blockchain Interactive",
        nav: {
            data: "Data",
            hashing: "Hashing",
            block: "Block",
            chain: "Chain",
            network: "Network",
            keys: "Keys",
            transactions: "Transactions",
            mempool: "Mempool",
            ecosystem: "Final",
        },

        // Intro (New)
        intro: {
            title: "Tired of hearing about blockchain",
            subtitle: "and not understanding what it is?",
            description: "We feel you. It seems complicated, but it's built on simple ideas. We made this page so you can touch these ideas. Just scroll and play.",
        },

        // Data
        data: {
            title: "The Data",
            description: "Everything starts with **Data**. Think of it as information.\n\nIn our toy blockchain, we use simple text strings to represent **Data**, like `\"Hello World\"`. Information about your bank account, your transactions - all of it is **Data**. While traditional systems store **Data** on specific servers, a Blockchain stores copies of this **Data** on thousands of different computers around the world to ensure it can't be changed. How? We will see in a moment!",
            instruction: "Type anything in the box. See how it's just raw information. Computers see this as a sequence of bytes (zeros and ones).",
            inputLabel: "Data Input",
            size: "Size (bytes)",
            placeholder: "Type your data here...",
        },

        // Hashing
        hashing: {
            title: "The Hash",
            description: "The **Hash** is a digital fingerprint of **Data**.\nHash generator converts any input (no matter how large) into a unique, fixed-length string. If you change even a single comma in the **Data**, the **Hash** changes completely. This process is one-way: you can't reverse the hash to retrieve the original data.",
            inputLabel: "Data Input",
            outputLabel: "Hash Output (256-bit or 32 bytes or 64 HEX characters)",
            placeholder: "Type something here...",
            emptyState: "Start typing...",
        },

        determinism: {
            title: "Determinism",
            description: "The same input always produces the same **Hash**. It doesn't matter if you're in New York or Moscow, using a phone or a supercomputer, today or tomorrow.",
            instruction: "Type the EXACT same text in both boxes (e.g. `Hello`). Watch the equality sign light up green!"
        },

        // Data Validity (New)
        dataValidity: {
            title: "Data Validity",
            description: "In the blockchain world, we consider **Data** to be valid if its **Hash** starts with `N` zeros. In our toy example `N = 4`. Only valid data can be stored in **Blockchain**. But how do we make any data valid? To do this, we add a random number after the data and change it until the **Hash** is valid.",
            instruction: "Try changing the number at the end of the text. The hash will likely turn red (invalid). Try to find another number that makes it green (valid)!",
            inputLabel: "Data + Random Number",
            outputLabel: "Resulting Hash"
        },

        // Mining Game
        miningGame: {
            title: "The Mining Game",
            description: "In **Blockchain** we call this special number a **Nonce**. For convenience let's split **Nonce** and our usefull **Data** into two fields - two parts of block. \nSo in order to prove that block is valid we need to find a **Nonce** that makes the **Hash** start with `0000`. We call this process **Proof of Work** or **Mining**.",
            instruction: "Let's play Mining game! Try to find such Nonce that makes the Hash start with '0000'. After 5 invalid attempt you will get a hint, click on it",
            statusTitle: "The Mining Game",
            statusSuccess: "VALID NONCE FOUND!",
            statusSubtitle: "Find a nonce that makes the hash start with 0000",
            dataLabel: "Data",
            nonceLabel: "Nonce (The Magic Number)",
            resultLabel: "Resulting Hash",
            valid: "VALID",
            invalid: "INVALID",
            hint: "Psst... try",
            explanation: "The Nonce is glued to your Data to create a new input!"
        },

        // Block
        block: {
            title: "The Block",
            description: "A **Block** is just a container of some fields (e.g. **Data**, **Nonce** and **Prev Hash**). All fields in **Block** is used to calculate its **Hash**. But remember, to participate in **Blockchain** block has to be valid. \nTherefore, as a **Miner** I want to find such **Nonce** that makes **Hash** starting with `0000`.",
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

        // Chain
        chain: {
            title: "The Chain",
            description: "You might note that block has field **Prev Hash**. This is **Hash** of previous block. This field also affects the final **Hash** of a **Block**. This is how we can connect blocks into the **Chain** or **Blockchain**!",
            instruction: "Mine all blocks to fix the Chain. Change data in Block #0. See how it breaks all blocks. Well, to change data in chain you need to mine everything after it!"
        },

        // Network
        network: {
            title: "The Network",
            description: "A **Blockchain** isn't stored in one place. It's distributed across thousands of computers, we call them **Nodes**. They can send new **Blocks** over the network, but they can't change existing blocks. If one **Node** tries to cheat (change existing blocks or produce invalid **Block**), the others just reject this synchronization attempt. If **Block** is valid, they will tell everyone they know about that.",
            clickNode: "Click a node to broadcast",
        },
        // Keys
        keys: {
            title: "Keys & Signatures",
            description: "To own funds on blockchain you need a **Wallet**. A wallet is an application that stores pair of keys: **Private Key** and **Public Key**. \n\n**Private key** allows you to sign **Data** (we also call it **Message**) providing **Signature** as result. **Signature** is similar to **Hash** but it can be generated only using **Private Key**. **Public Key** allows anyone to verify your **Signature**.\n\nAlgorithm of signing and verifying is mathematically complicated and was design in such way, that noone expect you can provide **Signature** from your private key and everyone in world can easly verify **Signature** using **Data** itself and **Public Key**!",
            instruction: "Generate a wallet, add message and sign it. Change something in message, see that signature is invalid now",
            newMessageTemplate: (date: string) => `Pay 50 coins to Bob at ${date}`,
        },
        // Transactions
        transactions: {
            title: "Signed Transactions",
            description: "Now we know how to sign data. Let's see how it's used in real blockchain transactions!\n\nA transaction is simply a record of value moving from one wallet to another. To make it official, the sender must sign the transaction with their **Private Key**. If anyone tries to change the amount or the receiver after it was signed, the **Signature** will become invalid.\n\nFinally, we calculate the **Transaction Hash** — a unique fingerprint of the entire transaction, including the **Signature**. This **Hash** is used to identify the transaction and prevent double-spending.",
            instruction: "Create a transaction, sign it, and then try to change the amount. Watch the signature fail!",
            from: "From (Public Key)",
            to: "To (Recipient Address)",
            amount: "Amount (Coins)",
            fee: "Fee",
            signature: "Signature",
            txHash: "Transaction Hash",
            statusValid: "Valid Signature",
            statusInvalid: "INVALID SIGNATURE",
            sign: "Sign Transaction",
        },

        // Mempool
        mempool: {
            title: "Mempool & Mining",
            description: "Transactions don't go directly into the blockchain. First, they enter a waiting area called the **Mempool**. Miners look at this queue and pick transactions to include in the next block. Usually, they sort them by **Fee** — the more you pay, the faster your transaction is processed. If a transaction has an invalid signature, the Miner will simply ignore it.",
            instruction: "Send transactions from different accounts. Watch them accumulate in the Queue. Then, click 'Mine' to see the Miner pick the best ones and create a new block!",
            phoneTitle: "My Wallet",
            queueTitle: "Mempool Queue",
            minerTitle: "Miner Node",
            sync: "Sync Wallet",
            send: "Send",
            sign: "Sign",
            accounts: "Accounts",
            emptyQueue: "No transactions in queue",
            mineButton: "Mine New Block",
            showChain: "Show Blockchain",
            hideChain: "Hide Blockchain",
            blocksProduced: "Blocks Produced",
            transactionsSaved: "Transactions Saved",
            initialBalances: "Initial Account Balances",
        },
        // Ecosystem (Final)
        ecosystem: {
            title: "Live Ecosystem",
            description: "Welcome to the living blockchain! Here, everything you've learned comes together. You have a **Wallet**, a **Network** of Nodes, and a real-time **Blockchain**. \n\nWhen you send a transaction, it goes to your selected **Node**. If the node is mining, it will eventually include your transaction in a new **Block**. Use **Auto Sync** to see how new blocks propagate through the network automatically, or do it manually to see how consensus works.",
            instruction: "Try to send coins from Alice to Bob. Mine the block on Node A. See how other nodes become 'Out of Sync' until you propagate the changes!",
            networkStatus: "Network Status",
            syncNetwork: "Sync Network",
            autoSync: "Auto Sync",
            networkView: "Network View",
            statusOk: "ALL NODES SYNCED",
            statusWarning: "NETWORK OUT OF SYNC",
            blocks: "blocks",
            transactions: "transactions",
            allowInvalid: "CHEAT MODE",
            cheatMode: "CHEAT MODE",
            autoMine: "AUTO MINE",
            invalidTx: "Invalid transaction",
            rejected: "Rejected ✗",
            accepted: "Accepted ✓",
            acceptedInvalid: "Accepted INVALID TX ⚠",
            invalid: "Invalid ✗",
        },
    },

    ru: {
        // Header
        title: "Интерактивный Блокчейн",
        nav: {
            data: "Данные",
            hashing: "Хеширование",
            block: "Блок",
            chain: "Цепь",
            network: "Сеть",
            keys: "Ключи",
            transactions: "Транзакции",
            mempool: "Мемпул",
            ecosystem: "Финал",
        },

        // Hero
        hero: {
            title: "Поймите блокчейн",
            subtitle: "прикоснувшись к нему.",
            description: "Не просто читайте о том, как это работает. Сломайте, исправьте и посмотрите, как данные движутся в реальном времени.",
        },

        intro: {
            title: "Устали слышать о блокчейне",
            subtitle: "и не понимать, что это?",
            description: "Мы вас понимаем. Это кажется сложным, но строится на простых идеях. Мы сделали эту страницу, чтобы вы могли потрогать эти идеи. Просто листайте и играйте.",
        },

        // Data
        data: {
            title: "Данные",
            description: "Всё начинается с **Данных**. В нашем игрушечном блокчейне мы используем простые строки, например \"Привет Мир\" или \"Транзакция: Алиса платит Бобу 10$\".\n\nНо в реальности этими данными может быть что угодно: финансовый реестр, медицинская запись или даже цифровое произведение искусства.",
            instruction: "Напишите что-нибудь в поле. Посмотрите, что это просто сырая информация. Компьютеры видят это как последовательность байтов.",
            inputLabel: "Ввод данных",
            size: "Размер (байт)",
            placeholder: "Введите данные здесь...",
        },

        // Hashing
        hashing: {
            title: "Цифровой отпечаток",
            description: "В основе блокчейна лежит **Хеш**. Думайте о нём как о цифровом отпечатке пальца.\n\nЕсли вы измените хотя бы одну запятую в данных, отпечаток полностью изменится.",
            inputLabel: "Ввод данных",
            outputLabel: "Хеш (256 бит)",
            placeholder: "Введите что-нибудь...",
            emptyState: "Начните печатать...",
        },

        determinism: {
            title: "Детерминизм",
            description: "Одинаковый ввод всегда дает одинаковый Хеш. Неважно, где вы находитесь: в Нью-Йорке или Москве, используете телефон или суперкомпьютер.",
            instruction: "Введите ТОЧНО такой же текст в оба поля (например, 'Привет'). Посмотрите, как знак равенства загорится зеленым!"
        },

        dataValidity: {
            title: "Валидность Данных",
            description: "В мире блокчейна мы считаем данные валидными, если их хеш начинается с N нулей. Только валидные данные могут быть сохранены. Но как сделать любые данные валидными? Для этого мы добавляем случайное число в конец данных и меняем его, пока хеш не станет правильным.",
            instruction: "Посмотрите на 'Hello World,124813'. Хеш красивый? Попробуйте изменить число. Хеш станет красным (невалидным). Измените обратно, чтобы он стал зеленым!",
            inputLabel: "Данные + Случайное Число",
            outputLabel: "Результат"
        },

        miningGame: {
            title: "Игра в Майнинг",
            description: "Искать это число вручную сложно. Давайте разделим их! Мы назовем это случайное число **Nonce**. Ваша цель — найти такой Nonce, который сделает хеш начинающимся с четырех нулей.",
            instruction: "Попробуйте найти **Nonce**, превращающий хеш в '0000...'. Можно кликать +1 или гадать вручную!",
            statusTitle: "Игра в Майнинг",
            statusSuccess: "УСПЕХ!",
            statusSubtitle: "Найдите nonce, чтобы хеш начинался с 0000",
            dataLabel: "Данные",
            nonceLabel: "Nonce (Магическое Число)",
            resultLabel: "Результат",
            valid: "ВАЛИДЕН",
            invalid: "НЕВАЛИДЕН",
            hint: "Псс... попробуй",
            explanation: "Nonce приклеивается к данным, создавая новый ввод!"
        },

        // Block
        block: {
            title: "Контейнер",
            description: "**Блок** — это просто контейнер для данных. Чтобы участвовать в Блокчейне, он должен быть валидным. Валидный блок — это наша Цель: блок, хеш которого начинается с N нулей (в нашем примере 4). Долгий процесс поиска подходящего Nonce называется **Майнинг** или **Proof of Work**",
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

        // Chain
        chain: {
            title: "Цепь",
            description: "**Блоки** связаны друг с другом. Каждый блок содержит отпечаток предыдущего. Если вы вернётесь и измените Блок 1, отпечаток изменится, разорвав связь с Блоком 2. Вся **Цепь** станет красной.",
            instruction: "Намайните все блоки, чтобы починить Цепь. Измените данные в Блоке #0. Смотрите, как ломаются все блоки. Чтобы изменить данные в цепи, нужно перемайнить всё после них!"
        },

        // Network
        network: {
            title: "Сеть",
            description: "Блокчейн не хранится в одном месте. Он распределён по тысячам компьютеров (**Узлов**). Они обмениваются информацией, чтобы делиться новыми блоками. Если один узел попытается обмануть, остальные отклонят это.",
            clickNode: "Нажмите на узел для трансляции",
        },
        // Keys
        keys: {
            title: "Ключи и Подписи",
            description: "Чтобы владеть средствами в блокчейне, вам нужен **Кошелек**. Кошелек — это просто пара ключей: **Приватный ключ** (для подписи транзакций) и **Публичный ключ** (для их проверки).",
            instruction: "Создайте кошелек. Скопируйте Приватный ключ для подписи. Затем скопируйте Публичный ключ и Подпись для проверки!",
            newMessageTemplate: (date: string) => `Заплатить Ивану 50 монет. Дата: ${date}`,
        },
        // Transactions
        transactions: {
            title: "Подписанные Транзакции",
            description: "Теперь мы знаем, как подписывать данные. Давайте посмотрим, как это используется в реальных транзакциях! Транзакция — это запись о перемещении ценности из одного кошелька в другой. Чтобы сделать её официальной, отправитель должен подписать её своим **Приватным Ключом**. Если кто-то попытается изменить сумму или получателя после подписи, **Подпись** станет недействительной. В завершение мы вычисляем **Хеш Транзакции** — уникальный отпечаток всей транзакции, включая **Подпись**. Именно этот хеш попадает в блок.",
            instruction: "Создайте транзакцию, подпишите её, а затем попробуйте изменить сумму. Смотрите, как подпись ломается!",
            from: "От кого (Публичный Ключ)",
            to: "Кому (Адрес получателя)",
            amount: "Сумма (Монеты)",
            fee: "Комиссия",
            signature: "Подпись",
            txHash: "Хеш Транзакции",
            statusValid: "Подпись Верна",
            statusInvalid: "ПОДПИСЬ НЕВЕРНА",
            sign: "Подписать Транзакцию",
        },

        // Mempool
        mempool: {
            title: "Мемпул и Майнинг",
            description: "Транзакции не попадают в блокчейн мгновенно. Сначала они оказываются в листе ожидания — **Мемпуле**. Майнеры просматривают эту очередь и выбирают транзакции для включения в следующий блок. Обычно они сортируют их по **Комиссии** — чем больше вы платите, тем быстрее пройдет платеж. Если подпись неверна, майнер просто проигнорирует такую транзакцию.",
            instruction: "Отправляйте транзакции с разных аккаунтов. Следите, как они копятся в очереди. Затем нажмите 'Майнить', чтобы майнер выбрал лучшие и создал новый блок!",
            phoneTitle: "Мой Кошелек",
            queueTitle: "Очередь (Мемпул)",
            minerTitle: "Узел Майнера",
            sync: "Синхронизировать",
            send: "Отправить",
            sign: "Подписать",
            accounts: "Аккаунты",
            emptyQueue: "В очереди пусто",
            mineButton: "Добыть блок",
            showChain: "Показать блокчейн",
            hideChain: "Скрыть блокчейн",
            blocksProduced: "Блоков произведено",
            transactionsSaved: "Транзакций сохранено",
            initialBalances: "Начальные балансы аккаунтов",
        },
        // Ecosystem (Final)
        ecosystem: {
            title: "Живая Экосистема",
            description: "Добро пожаловать в живой блокчейн! Здесь всё, чему вы научились, объединяется. У вас есть **Кошелек**, **Сеть** узлов и **Блокчейн** в реальном времени. \n\nКогда вы отправляете транзакцию, она попадает в выбранный **Узел**. Если узел майнит, он включит вашу транзакцию в новый **Блок**. Используйте **Авто-синхронизацию**, чтобы увидеть, как новые блоки распространяются по сети автоматически, или делайте это вручную, чтобы понять, как работает консенсус.",
            instruction: "Попробуйте отправить монеты от Алисы Бобу. Намайните блок на Узле А. Посмотрите, как другие узлы 'выпадают из синхронизации', пока вы не распространите изменения!",
            networkStatus: "Статус сети",
            syncNetwork: "Синхронизировать сеть",
            autoSync: "Авто-синхронизация",
            networkView: "Вид сети",
            statusOk: "СЕТЬ СИНХРОНИЗИРОВАНА",
            statusWarning: "СЕТЬ НЕ СИНХРОНИЗИРОВАНА",
            blocks: "блоков",
            transactions: "транзакций",
            allowInvalid: "ЧИТ-РЕЖИМ",
            cheatMode: "ЧИТ-РЕЖИМ",
            autoMine: "АВТО-МАЙНИНГ",
            invalidTx: "Некорректная транзакция",
            rejected: "Отклонено ✗",
            accepted: "Принято ✓",
            acceptedInvalid: "Принято INVALID TX ⚠",
            invalid: "Ошибка ✗",
        },
    },
} as const;

export type Language = 'en' | 'ru';

export type TranslationKeys = typeof translations.en;

export function getLocaleByLanguage(language: Language) {
    switch (language) {
        case 'en':
            return 'en-US';
        case 'ru':
            return 'ru-RU';
        default:
            return 'en-US';
    }
}

export function getHour12UsageByLanguage(language: Language) {
    switch (language) {
        case 'en':
            return true;
        case 'ru':
            return false;
        default:
            return true;
    }
}
