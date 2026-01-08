
export interface Rank {
    name: string;
    value: number;
}

export interface Card {
    rank: Rank;
    suit: string;
}

export interface User {
    USER_ID: string;
    TURN_CARD: Card[];
}