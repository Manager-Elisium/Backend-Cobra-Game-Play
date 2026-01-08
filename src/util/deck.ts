import { Card, Rank, User } from "src/interface/card";

/**
 * 
 * @description Common Service => Create Card
 * 
 */
async function createCard(rank: Rank, suit: string) {
    return { rank, suit };
}

/**
 * 
 * @description Card String
 * 
 */
async function cardToString(card: Card) {
    return `${card.rank.name} of ${card.suit}`;
}

/**
 * 
 * @description Create Deck (One Deck)
 * 
 */
async function createDeck(): Promise<Card[]> {
    const ranks: Rank[] = [
        { name: 'Ace', value: 1 },
        { name: '2', value: 2 },
        { name: '3', value: 3 },
        { name: '4', value: 4 },
        { name: '5', value: 5 },
        { name: '6', value: 6 },
        { name: '7', value: 7 },
        { name: '8', value: 8 },
        { name: '9', value: 9 },
        { name: '10', value: 10 },
        { name: 'Jack', value: 11 },
        { name: 'Queen', value: 12 },
        { name: 'King', value: 13 }
    ];
    const suits = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
    const deck: Card[] = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push(await createCard(rank, suit));
        }
    }
    return deck;
}

/**
 * 
 * @description Shuffle Card (One Deck)
 * 
 */
async function shuffleDeck(deck: Card[]): Promise<Card[]> {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

/**
 * 
 * @description Draw single card
 * 
 */
async function drawCard(deck: Card[]): Promise<Card | undefined> {
    return deck.pop();
}

/**
 * 
 * @description Get Deck Size
 * 
 */
async function getDeckSize(deck: Card[]): Promise<number> {
    return deck.length;
}


/**
 * 
 * @description Find Highest Card With Player
 * 
 */
async function findHighestCard(players: User[]) {
    let highestCard: Card | undefined;
    let highestPlayerIndex: string | undefined;
    let highestPriority = -1;
    const suitPriority = {
        'Spades': 4,
        'Hearts': 3,
        'Diamonds': 2,
        'Clubs': 1
    };
    for (let i = 0; i < players.length; i++) {
        const currentPlayerCards = players[i].TURN_CARD;
        if (!highestPlayerIndex) {
            highestCard = currentPlayerCards?.[0];
            highestPlayerIndex = players?.[i].USER_ID;
            highestPriority = suitPriority[currentPlayerCards?.[0].suit];
        } else {
            if (currentPlayerCards?.[0]?.rank?.value > highestCard?.rank?.value) {
                highestCard = currentPlayerCards?.[0];
                highestPlayerIndex = players?.[i]?.USER_ID;
                highestPriority = suitPriority[currentPlayerCards?.[0]?.suit];
            } else if (currentPlayerCards?.[0]?.rank?.value == highestCard?.rank?.value) {
                if (suitPriority[currentPlayerCards[0].suit] > highestPriority) {
                    highestCard = currentPlayerCards[0];
                    highestPlayerIndex = players[i].USER_ID;
                    highestPriority = suitPriority[currentPlayerCards[0].suit];
                }
            }
        }
    }
    return { highestPlayerIndex, highestCard };
}
// async function findHighestCard(players: User[]) {
//     let highestCard: Card | undefined;
//     let highestPlayerIndex: string | undefined;
//     let highestPriority = -Infinity;
//     const suitPriority = {
//         'Spades': 4,
//         'Hearts': 3,
//         'Diamonds': 2,
//         'Clubs': 1
//     };
//     for (let i = 0; i < players.length; i++) {
//         const playerCards = players[i].TURN_CARD;
//         const playerHighestCard = playerCards.reduce((highest, current) => {
//             if (!highest) {
//                 return current;
//             } else if (current.rank.value > highest.rank.value) {
//                 return current;
//             } else if (current.rank.value === highest.rank.value) {
//                 // Add Logic For Priority
//                 const priority = suitPriority[current.suit];
//                 if (priority > highestPriority) {
//                     return current;
//                 } else {
//                     return highest;
//                 }
//             } else {
//                 // If rank same 
//                 // priority check 'Spades', 'Hearts', 'Diamonds', 'Clubs'
//                 return highest;
//             }
//         });

//         if (!highestCard || playerHighestCard.rank.value > highestCard.rank.value) {
//             highestCard = playerHighestCard;
//             highestPlayerIndex = players[i].USER_ID;
//         }
//     }
//     return { highestPlayerIndex, highestCard };
// }

export { createCard, cardToString, createDeck, shuffleDeck, drawCard, getDeckSize, findHighestCard };