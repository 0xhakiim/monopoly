export type PropertyColor =
    | 'brown'
    | 'lightBlue'
    | 'pink'
    | 'orange'
    | 'red'
    | 'yellow'
    | 'green'
    | 'darkBlue';

export type SpaceType =
    | 'property'
    | 'railroad'
    | 'utility'
    | 'corner'
    | 'tax'
    | 'chance'
    | 'community';

export interface Property {
    id: number;
    name: string;
    type: SpaceType;
    price?: number;
    rent?: number;
    color?: PropertyColor;
    owner?: number;
}

export interface Player {
    id: number;
    name: string;
    money: number;
    position: number;
    color: string;
    properties: number[];
}

export interface GameState {
    players: Player[];
    currentPlayer: number;
    diceRoll: number[];
    isRolling: boolean;
}
