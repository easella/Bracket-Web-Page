import { Team } from './team';
import { Bracket } from './bracket';
import { Injectable } from '@angular/core';

@Injectable()
export class BracketMakerService {

    constructor() { }

    private currentTeam: number;
    private seedOrder: number[] = [1, 16, 8, 9, 5, 12, 4, 13, 6, 11, 3, 14, 7, 10, 2, 15];

    CreateBlankBracket(data: any): Bracket {
        this.currentTeam = 0;
        return this.CBB(data, 0);
    }

    CreateCompleteCorrectBracket(data: any): Bracket {
        let blankBracket: Bracket = this.CreateBlankBracket(data);
        let finishedBracket: Bracket = this.FillOutCorrectBracket(blankBracket, data);
        return finishedBracket;
    }

    private FillOutCorrectBracket(node: Bracket, data: any): Bracket {
        if (!node.left.team) {
            node.left.team = this.FillOutCorrectBracket(node.left, data).team;
        }
        if (!node.right.team) {
            node.right.team = this.FillOutCorrectBracket(node.right, data).team;
        }

        //Not good. Should find a better way soon
        if (node.depth == 0) {//Championship
            if (node.left.team.teamName == data.FF.winners.championship) {
                node.team = node.left.team;
            } else if (node.right.team.teamName == data.FF.winners.championship) {
                node.team = node.right.team;
            } else {
                throw new Error("Championship team names did not match data winner: " + node.left.team.teamName + node.right.team.teamName + data.FF.winners.championship);
            }
        } else if (node.depth == 1) {//FinalFour
            if (node.left.team.teamName == data.FF.winners.finalFour[0] || node.left.team.teamName == data.FF.winners.finalFour[1]) {
                node.team = node.left.team;
            } else if (node.right.team.teamName == data.FF.winners.finalFour[0] || node.right.team.teamName == data.FF.winners.finalFour[1]) {
                node.team = node.right.team;
            } else {
                throw new Error("Final Four team names did not match data winner: " + node.left.team.teamName + node.right.team.teamName + data.FF.winners.finalFour);
            }
        } else if (node.depth == 2) {//EliteEight
            for (let i = 0; i < data.Regions.length; i++) {
                if (node.left.team.region == data.Regions[i].regionName) {
                    if (node.left.team.seed == data.Regions[i].winners.fourthRound) {
                        node.team = node.left.team;
                        i = data.Regions.length + 1;
                    } else if (node.right.team.seed == data.Regions[i].winners.fourthRound) {
                        node.team = node.right.team;
                        i = data.Regions.length + 1;
                    } else {
                        throw new Error("Elite Eight seeds didn't match up properly" + node.left.team.seed + " " + node.right.team.seed + " " + data.Regions[i].winners.fourthRound);
                    }
                }
            }
            if (!node.team) {
                throw new Error("Elite Eight no team added");
            }
        } else if (node.depth >= 3) {//Sweet Sixteen - 1st round
            let regionWinners;
            for (let i = 0; i < data.Regions.length; i++) {
                if (node.left.team.region == data.Regions[i].regionName) {
                    if (node.depth == 3) {
                        regionWinners = data.Regions[i].winners.thirdRound;
                    } else if (node.depth == 4) {
                        regionWinners = data.Regions[i].winners.secondRound;
                    } else if (node.depth == 5) {
                        regionWinners = data.Regions[i].winners.firstRound;
                    }
                    for (let j = 0; j < regionWinners.length; j++) {
                        if (node.left.team.seed == regionWinners[j]) {
                            node.team = node.left.team;
                            j = regionWinners.length + 1;
                            i = data.Regions.length + 1;
                        } else if (node.right.team.seed == regionWinners[j]) {
                            node.team = node.right.team;
                            j = regionWinners.length + 1;
                            i = data.Regions.length + 1;
                        }
                    }
                    if (!node.team) {
                        throw new Error("No team added: " + node.left.team + node.right.team + " Depth: " + node.depth);
                    }
                }
            }

        }

        return node;
    }

    private CBB(data: any, depth: number): Bracket {
        let root = new Bracket(depth);
        if (depth < 6) {
            root.left = this.CBB(data, depth + 1);
            root.left.parent = root;
            root.right = this.CBB(data, depth + 1);
            root.right.parent = root;
        } else {
            root.team = new Team(this.seedOrder[(this.currentTeam) % 16], data.Regions[Math.floor(this.currentTeam / 16)].teams[this.seedOrder[(this.currentTeam) % 16] - 1]);
            root.team.region = data.Regions[Math.floor(this.currentTeam / 16)].regionName;
            this.currentTeam++;
        }
        return root;
    }
}