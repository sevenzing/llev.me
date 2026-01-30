export const en = {
    // Header
    title: "Blockchain Interactive",
    nav: {
        data: "Data",
        hashing: "Hashing",
        determinism: "Determinism",
        validity: "Validity",
        block: "Block",
        chain: "Chain",
        network: "Network",
        keys: "Keys",
        transactions: "Transactions",
        mempool: "Mempool",
        ecosystem: "Final",
        cancel: "Cancel",
    },

    // Hero
    hero: {
        title: "Understand Blockchain",
        subtitle: "by touching it.",
        description: "Don't just read about how it works. Break it, fix it, and see how data moves in real time.",
    },

    // Intro
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
        instruction: "Type anything in the box to the right. Watch how the Hash changes completely with even a single character difference!",
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

    // Data Validity
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
        instruction: "Change the data to anything you want to store in Block. Then find the Nonce. Or dont waste your time and click Mine and fix the Block!",
        nonce: "Nonce",
        data: "Data",
        prevHash: "Prev Hash",
        hash: "Hash",
        mine: "Mine",
        mining: "Mining...",
        signed: "Block Signed",
        blockNumber: "Block #",
        dataPlaceholder: "Transaction data...",
        transactionsTitle: (count: number) => `Transactions (${count})`,
        noTransactions: "No transactions",
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
        instruction: "Click on any Node to see its blockchain. Try to change data in one node and try to sync the network! Try to add new Blocks, mine and sync the network. Try to cheat and see what will happen!",
        clickNode: "Click a node to broadcast",
        addNode: "Add Node",
        syncNetwork: "Sync Network",
        syncing: "Syncing...",
        stealMoney: "Steal Money",
        legend: "Click to select • Drag to move • Double-click & drag to connect",
        selectNode: "Select a node to view its blockchain",
        nodeChain: (id: string) => `Node ${id}'s Blockchain`,
    },
    // Keys
    keys: {
        title: "Keys & Signatures",
        description: "To own funds on blockchain you need a **Wallet**. A wallet is an application that stores pair of keys: **Private Key** and **Public Key**. \n\n**Private key** allows you to sign **Data** (we also call it **Message**) providing **Signature** as result. **Signature** is similar to **Hash** but it can be generated only using **Private Key**. **Public Key** allows anyone to verify your **Signature**.\n\nAlgorithm of signing and verifying is mathematically complicated and was design in such way, that noone expect you can provide **Signature** from your private key and everyone in world can easly verify **Signature** using **Data** itself and **Public Key**!",
        instruction: "Generate a wallet. Copy the Private Key to sign a message. Then copy the Public Key and Signature to verify it!",
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
        description: "Transactions don't go directly into the blockchain. First, they enter a waiting area called the **Mempool**. Miners look at this queue and pick transactions to include in the next block. Usually, they sort them by **Fee** — the more you pay, the faster your transaction is processed. If a transaction has an invalid signature, the Miner will simply ignore it. \n\nCheck the blockchain at the bottom of the page to see your transactions being added!",
        instruction: "Send transactions from different accounts. Watch them accumulate in the Queue. Try to send an invalid transaction (e.g. from an account with no balance) and see how the miner ignores it! When ready, click 'Mine' to create a new block.",
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
        unsignedTx: "Unsigned Transaction",
        unsignedTxConfirm: "Are you sure you want to submit a transaction without a signature?",
        unsignedTxWarning: "Miners will likely reject it because the signature is missing.",
        sendAnyway: "Send Anyway",
        insufficientBalance: "Insufficient Balance",
        insufficientBalanceDesc: (account: string, balance: number, requested: number) => `${account} only has ${balance} coins. You are trying to send ${requested} coins.`,
        insufficientBalanceWarning: "On a real blockchain, this transaction would be rejected by nodes.",
        connected: "CONNECTED TO BLOCKCHAIN",
        nodeIdle: "Node Idle",
        searchingNonce: "Searching valid nonce...",
        feeTip: "Transactions are sorted by Fee. High fees get prioritized by miners.",
        ledgerTitle: "Miner's Blockchain Ledger",
    },
    // Ecosystem (Final)
    ecosystem: {
        title: "Live Ecosystem",
        description: "Welcome to the living blockchain! Here, everything you've learned comes together. You have a **Wallet**, a **Network** of Nodes, and a real-time **Blockchain**. \n\nWhen you send a transaction, it goes to your selected **Node**. If the node is mining, it will eventually include your transaction in a new **Block**. Use `AUTO SYNC` to see how new blocks propagate through the network automatically, or do it manually to see how consensus works.",
        instruction: "Try to send coins from Alice to Bob. Mine the block on Node A. See how other nodes become 'Out of Sync' until you propagate the changes by pressing the `Sync Network` button. You can also try to mine blocks on multiple nodes to see how they fork!",
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
        nodeInspector: (id: string) => `Node ${id} Inspector`,
    },
};

export type TranslationKeys = typeof en;
