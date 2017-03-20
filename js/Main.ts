'use strict';
class Team {
    seed: number;
    teamName: string;
    constructor(seed: number, teamName: string) {
        this.seed = seed;
        this.teamName = teamName;
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
var completedBracket: TreeNode = FillOutBracket(bracketRoot, LogXSeedDifference);
console.log(completedBracket.team.teamName);
//EndMain

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
        currentTeam++;
    }
    return root;
}

function FillOutBracket(node: TreeNode, algorith) : TreeNode {
    if (!node.left.team) {
        FillOutBracket(node.left, algorith).team;
    }
    if (!node.right.team) {
        FillOutBracket(node.right, algorith).team;
    }

    let winningTeam: Team = algorith(node.left.team, node.right.team);
    if (winningTeam == node.left.team) {
        node.team = winningTeam;
        return node;
    } else if (winningTeam == node.right.team) {
        node.team = winningTeam;
        return node;
    } else {
        throw new ReferenceError("No teams won");
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