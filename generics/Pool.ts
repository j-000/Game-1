import { Game } from "./Game";


export class Pool<T> {
    private items: Array<T>;
    game: Game;
    maxItems: number;
    
    constructor(itemClass: new (game: Game) => T, maxItems: number, game: Game){
        // Store params as properties
        this.items = [];
        this.game = game;
        this.maxItems = maxItems;

        // Initialize items array with maxItems count of itemClass
        for(let i = 0; i < maxItems; i++){
            this.items.push(new itemClass(game))
        }
    }

    // To use "for ... of"
    *[Symbol.iterator]() {
        for(let item of this.items) {
            yield item
        }
    }
    
    // Size of pool 
    public get length(): number {
        return this.items.length;
    }

    // Add 1 item
    add(item: T): void {
        this.items.push(item);
    }
   
    // Get item by index
    get(index: number): T{
        if(index > this.items.length) throw new Error("Index out of range.");
        return this.items[index]
    }
}


