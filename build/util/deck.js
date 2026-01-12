"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findHighestCard = exports.getDeckSize = exports.drawCard = exports.shuffleDeck = exports.createDeck = exports.cardToString = exports.createCard = void 0;
/**
 *
 * @description Common Service => Create Card
 *
 */
async function createCard(rank, suit) {
    return { rank, suit };
}
exports.createCard = createCard;
/**
 *
 * @description Card String
 *
 */
async function cardToString(card) {
    return `${card.rank.name} of ${card.suit}`;
}
exports.cardToString = cardToString;
/**
 *
 * @description Create Deck (One Deck)
 *
 */
async function createDeck() {
    const ranks = [
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
    const deck = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push(await createCard(rank, suit));
        }
    }
    return deck;
}
exports.createDeck = createDeck;
/**
 *
 * @description Shuffle Card (One Deck)
 *
 */
async function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}
exports.shuffleDeck = shuffleDeck;
/**
 *
 * @description Draw single card
 *
 */
async function drawCard(deck) {
    return deck.pop();
}
exports.drawCard = drawCard;
/**
 *
 * @description Get Deck Size
 *
 */
async function getDeckSize(deck) {
    return deck.length;
}
exports.getDeckSize = getDeckSize;
/**
 *
 * @description Find Highest Card With Player
 *
 */
async function findHighestCard(players) {
    let highestCard;
    let highestPlayerIndex;
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
        }
        else {
            if (currentPlayerCards?.[0]?.rank?.value > highestCard?.rank?.value) {
                highestCard = currentPlayerCards?.[0];
                highestPlayerIndex = players?.[i]?.USER_ID;
                highestPriority = suitPriority[currentPlayerCards?.[0]?.suit];
            }
            else if (currentPlayerCards?.[0]?.rank?.value == highestCard?.rank?.value) {
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
exports.findHighestCard = findHighestCard;
