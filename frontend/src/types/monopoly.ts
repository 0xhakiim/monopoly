export type PropertyColor =
    | 'brown'
    | 'lightBlue'
    | 'pink'
    | 'orange'
    | 'red'
    | 'yellow'
    | 'green'
    | 'darkBlue';
export type WSMessage = {
    action: string;
    payload?: any;
};
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
    name?: string;
    money: number;
    position: number;
    color: string;
    properties: number[];
}


export interface PropertyDetails {
    price: number;
    rent: number[]; // Added based on user's example
    house_cost: number; // Added based on user's example
    group_id: string; // Added based on user's example
}

export interface SquareTile {
    id: number;
    name: string;
    type: string;
    details?: PropertyDetails; // Price lives here for purchasable tiles
    tax_amount?: number;
}
type IncomingPlayerTuple = [number, Player];
type IncomingData = IncomingPlayerTuple[];
export interface GameState {
    turn_index: number;
    positions: Record<number, number>; // player ID -> position
    money: Record<number, number>; // player ID -> money
    board: any; // mutable_properties array/object
    player: IncomingPlayerTuple[];
    phase: string;
    propertyForSale?: SquareTile;
    dice?: [number, number];
    highest_bid?: number;
    highest_bidder_id?: number | null;
    active_auction_players?: number[]; // IDs of players still in the auction
}
export interface auctionState {
    auctionProperty: SquareTile;
    highest_bid: number;
    highest_bidder: Player | null;
    active_players: number[]; // IDs of players still in the auction
    turn_index: number;
}