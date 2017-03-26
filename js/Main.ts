'use strict';
class Team {
    seed: number;
    teamName: string;
    region: string;
    correct: boolean;
    constructor(seed: number, teamName: string) {
        this.seed = seed;
        this.teamName = teamName;
    }
}

class Result {
    firstRound: number;
    secondRound: number;
    sweetSixteen: number;
    eliteEight: number;
    finalFour: number;
    championship: number;
    constructor() {
        this.firstRound = 0;
        this.secondRound = 0;
        this.sweetSixteen = 0;
        this.eliteEight = 0;
        this.finalFour = 0;
        this.championship = 0;
    }
}

class TreeNode {
    team: Team;
    parent: TreeNode;
    left: TreeNode;
    right: TreeNode;
    depth: number;
    constructor(depth: number, parent?: TreeNode) {
        this.depth = depth;
        if (parent) {
            this.parent = parent;
        } else {
            this.parent = null;
        }
    }
}
//Main
declare function require(name: string);
var bracketData = require('../Data/2015.json');
var currentTeam = 0;
var seedOrder: number[] = [1,16,8,9,5,12,4,13,6,11,3,14,7,10,2,15];
var bracketRoot: TreeNode = CreateBlankBracket(bracketData);
var filledOutUserBracket: TreeNode = FillOutBracket(bracketRoot, LogXSeedDifference);
console.log(filledOutUserBracket.team.teamName);
currentTeam = 0;
var completeCorrectBracket = CreateCompleteCorrectBracket(bracketData);
var userBracketWithResults = AddResultsToUserBracket(completeCorrectBracket, filledOutUserBracket);
console.log(userBracketWithResults.team.correct);
var results: Result = GiveResults(userBracketWithResults);
console.log(results);
//EndMain

function GiveResults(bracket: TreeNode, result?: Result): Result {
    let output;
    if (!result) {
        output = new Result();
    } else {
        output = result;
    }
    if (bracket.left.left) {
        output = GiveResults(bracket.left, output);
    }
    if (bracket.right.right) {
        output = GiveResults(bracket.right, output);
    }
    if (bracket.team.correct) {
        switch (bracket.depth) {
            case 0:
                output.championship++;
                break;
            case 1:
                output.finalFour++;
                break;
            case 2:
                output.eliteEight++;
                break;
            case 3:
                output.sweetSixteen++;
                break;
            case 4:
                output.secondRound++;
                break;
            case 5:
                output.firstRound++;
                break;
        }
    }
    return output;
}

function AddResultsToUserBracket(correctBracket: TreeNode, userBracket: TreeNode): TreeNode {
    if (userBracket.left.left && userBracket.left.team.correct == null) {
        userBracket.left = AddResultsToUserBracket(correctBracket.left, userBracket.left);
    }
    if (userBracket.right.right && userBracket.right.team.correct == null) {
        userBracket.right = AddResultsToUserBracket(correctBracket.right, userBracket.right);
    }
    if (correctBracket.team.teamName == userBracket.team.teamName) {
        userBracket.team.correct = true;
    } else {
        userBracket.team.correct = false;
    }
    return userBracket;
}

function ScoreBracket(correctBracket: TreeNode, userBracket: TreeNode): Result {
    return new Result();
}

function CreateCompleteCorrectBracket(data): TreeNode {
    var blankBracket: TreeNode = CreateBlankBracket(data);
    var finishedBracket: TreeNode = FillOutCorrectBracket(blankBracket, data);
    return finishedBracket;
}

function FillOutCorrectBracket(node: TreeNode, data): TreeNode {
    if (!node.left.team) {
        node.left.team = FillOutCorrectBracket(node.left, data).team;
    }
    if (!node.right.team) {
        node.right.team  = FillOutCorrectBracket(node.right, data).team;
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
                    } else if ( node.right.team.seed == regionWinners[j]) {
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

function CreateBlankBracket(data?, depth?: number) : TreeNode{
    if (!depth) {
        depth = 0;
    }
    if (!data) {
        data = bracketData;
    }
    let root = new TreeNode(depth);
    if (depth < 6) {
        root.left = CreateBlankBracket(data, depth+1);
        root.left.parent = root;
        root.right = CreateBlankBracket(data, depth+1);
        root.right.parent = root;
    } else {
        root.team = new Team(seedOrder[(currentTeam)%16], data.Regions[Math.floor(currentTeam/16)].teams[seedOrder[(currentTeam)%16]-1]);
        root.team.region = data.Regions[Math.floor(currentTeam/16)].regionName;
        currentTeam++;
    }
    return root;
}

function FillOutBracket(node: TreeNode, algorith) : TreeNode {
    if (!node.left.team) {
        node.left.team = FillOutBracket(node.left, algorith).team;
    }
    if (!node.right.team) {
        node.right.team = FillOutBracket(node.right, algorith).team;
    }

    let winningTeam: Team = algorith(node.left.team, node.right.team);
    if (winningTeam == node.left.team) {
        node.team = winningTeam;
        return node;
    } else if (winningTeam == node.right.team) {
        node.team = winningTeam;
        return node;
    } else {
        throw new Error("No teams won");
    }
}

function BestTeamWins(team1: Team, team2: Team): Team {
    if (team1.seed < team2.seed) {
        return team1;
    } else if (team1.seed == team2.seed && Math.random() > 0.5) {
        return team1;
    } else {
        return team2;
    }
}

function LogXSeedDifference(team1: Team, team2: Team): Team {
    var logBase: number = 2;
    let seedDifference: number = Math.abs(team1.seed-team2.seed);
    let numberOfFlips: number = LogCalculator(logBase, seedDifference);
    let oddsOfWinning: number = Math.pow(0.5,numberOfFlips);
    let lowSeededTeam: Team = (team1.seed <= team2.seed) ? team1 : team2;
    let highSeededTeam: Team = (team1.seed > team2.seed) ? team1 : team2;

    if (oddsOfWinning < Math.random()) {
        return lowSeededTeam;
    } else {
        return highSeededTeam;
    }
}

function LogCalculator(base: number, input: number): number {
    return Math.log2(input)/Math.log2(base);
}