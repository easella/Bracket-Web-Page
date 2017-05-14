import { Team } from './team';
export class Bracket {
    team: Team;
    parent: Bracket;
    left: Bracket;
    right: Bracket;
    depth: number;
    constructor(depth: number, parent?: Bracket) {
        this.depth = depth;
        if (parent) {
            this.parent = parent;
        } else {
            this.parent = null;
        }
    }
}