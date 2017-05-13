export class Team {
    seed: number;
    teamName: string;
    region: string;
    correct: boolean;
    constructor(seed: number, teamName: string) {
        this.seed = seed;
        this.teamName = teamName;
    }
}