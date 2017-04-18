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
    static firstRound: number = 0;
    static secondRound: number = 1;
    static sweetSixteen: number = 2;
    static eliteEight: number = 3;
    static finalFour: number = 4;
    static championship: number = 5;
    collective: number[];
    constructor() {
        this.collective = [0, 0, 0, 0, 0, 0];
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
var seedPerformance = require('../Data/seedPerformance.json');
var bracketData = require('../Data/2015.json');
var _ = require('lodash');
var currentTeam = 0;
var seedOrder: number[] = [1, 16, 8, 9, 5, 12, 4, 13, 6, 11, 3, 14, 7, 10, 2, 15];
var statText: string[] = ["First Round: ", "Second Round: ", "Sweet Sixteen: ", "Elite Eight: ", "Final Four: ", "Championship: "];
var numberOfSimulations = 1000;
var algorithmToUse = HistoricalData;

window.onload = () => {
    document.getElementById("simulateButton").onclick = function() {SimulateButtonClick()};
    SimulateAndAddBestToDOM();
};

//EndMain

function SimulateAndAddBestToDOM() {
    let bestResult: Result = new Result();
    let bestBracket: TreeNode;
    let totalResult: Result = new Result();
    for (let i = 0; i < numberOfSimulations; i++) {
        let tempBracket: TreeNode = SimulateBracket(bracketData, algorithmToUse);
        let tempResult: Result = GiveResults(tempBracket);
        for (let j = 0; j < tempResult.collective.length; j++) {
            totalResult.collective[j] += tempResult.collective[j];
        }
        if (GiveBestResult(bestResult, tempResult) == tempResult) {
            bestResult = tempResult;
            bestBracket = tempBracket;
            AddBracketToDOM(bestBracket);
        }
        if (i % 10000 == 0) {
            console.log("" + i + ": " + bestResult.collective);
        }
    }
    for (let i = 0; i < totalResult.collective.length; i++) {
        totalResult.collective[i] = totalResult.collective[i] / numberOfSimulations;
    }
    DisplayResult(totalResult, document.querySelectorAll("#averageGamesWon .results"));
    DisplayResult(bestResult, document.querySelectorAll("#bestBracket .results"));
    AddBracketToDOM(bestBracket);
}

function DisplayResult(results: Result, resultDOM: NodeListOf<Element>) {
    for (let i = 0; i < results.collective.length; i++) {
        resultDOM[i].textContent = statText[i] + results.collective[i];
    }
}

function SimulateButtonClick() {
    numberOfSimulations = parseInt((<HTMLInputElement>document.getElementById("number-of-simulations")).value);
    SetAlgorithm((<HTMLInputElement>document.getElementById('algorithmSelect')).value);
    RemoveClass("correct");
    RemoveClass("wrong");
    SimulateAndAddBestToDOM();
}

function RemoveClass(classToRemove: string) {
    let objects = document.querySelectorAll("."+classToRemove);
    for (let i = 0; i < objects.length; i++) {
        objects[i].classList.remove(classToRemove);
    }
}

function SetAlgorithm(input: string) {
    if (input == "historical") {
        algorithmToUse = HistoricalData;
    } else if (input == "log2") {
        algorithmToUse = LogXSeedDifference;
    } else if (input == "random") {
        algorithmToUse = FlipACoin;
    } else {
        console.log("Algorithm chosen is wrong");
    }
}

function AddBracketToDOM(bracket: TreeNode) {
    let firstRoundTeams: Team[] = GetAllFirstRoundTeams(bracket);
    let secondRoundTeams: Team[] = GetAllSecondRoundTeams(bracket);
    let sweetSixteenTeams: Team[] = GetSweetSixteenTeams(bracket);
    let eliteEightTeams: Team[] = GetEliteEightTeams(bracket);
    let finalFourTeams: Team[] = GetFinalFourTeams(bracket);
    let championshipTeams: Team[] = GetChampionshipTeams(bracket);
    let champion: Team[] = GetChampion(bracket);
    let roundOneGamesLi = document.querySelectorAll(".round-1 .game-top, .round-1 .game-bottom");
    let roundTwoGamesLi = document.querySelectorAll(".round-2 .game-top, .round-2 .game-bottom");
    let sweetSixteenGamesLi = document.querySelectorAll(".round-3 .game-top, .round-3 .game-bottom");
    let eliteEightGamesLi = document.querySelectorAll(".round-4 .game-top, .round-4 .game-bottom");
    let finalFourGamesLi = document.querySelectorAll(".round-5 .game-top");
    let finalFourChampionshipBracketLi = document.querySelectorAll(".final-four .game-top, .final-four .game-bottom");
    let championshipBracketLi = document.querySelectorAll(".championship .game-top, .championship .game-bottom");
    let championLi = document.querySelectorAll(".champion .game-top");
    for (let i = 0; i < roundOneGamesLi.length; i++) {
        roundOneGamesLi[i].textContent = firstRoundTeams[i].teamName;
    }
    RemoveClass("correct");
    RemoveClass("wrong");
    AddTeamsToDOM(roundTwoGamesLi, secondRoundTeams);
    AddTeamsToDOM(sweetSixteenGamesLi, sweetSixteenTeams);
    AddTeamsToDOM(eliteEightGamesLi, eliteEightTeams);
    AddTeamsToDOM(finalFourGamesLi, finalFourTeams);
    AddTeamsToDOM(finalFourChampionshipBracketLi, finalFourTeams);
    AddTeamsToDOM(championshipBracketLi, championshipTeams);
    AddTeamsToDOM(championLi, champion);
}

function AddTeamsToDOM(gameLi, teams: Team[]) {
    for (let i = 0; i < gameLi.length; i++) {
        gameLi[i].textContent = teams[i].teamName;
        if (teams[i].correct) {
            gameLi[i].classList.add("correct");
        } else {
            gameLi[i].classList.add("wrong");
        }
    }
}


function GetAllFirstRoundTeams(bracket: TreeNode): Team[] {
    let output: Team[] = new Array<Team>();
    if (bracket.left) {
        output = output.concat(GetAllFirstRoundTeams(bracket.left));
    }
    if (bracket.right) {
        output = output.concat(GetAllFirstRoundTeams(bracket.right));
    }
    if (!bracket.left && !bracket.right) {
        output.push(bracket.team);
    }
    return output;
}

function GetAllSecondRoundTeams(bracket: TreeNode): Team[] {
    let output: Team[] = new Array<Team>();
    if (bracket.left.left) {
        output = output.concat(GetAllSecondRoundTeams(bracket.left));
    }
    if (bracket.right.right) {
        output = output.concat(GetAllSecondRoundTeams(bracket.right));
    }
    if (!bracket.left.left && !bracket.right.right) {
        output.push(bracket.team);
    }
    return output;
}

function GetSweetSixteenTeams(bracket: TreeNode): Team[] {
    let output: Team[] = new Array<Team>();
    if (bracket.left.left.left) {
        output = output.concat(GetSweetSixteenTeams(bracket.left));
    }
    if (bracket.right.right.right) {
        output = output.concat(GetSweetSixteenTeams(bracket.right));
    }
    if (!bracket.left.left.left && !bracket.right.right.right) {
        output.push(bracket.team);
    }
    return output;
}

function GetEliteEightTeams(bracket: TreeNode): Team[] {
    let output: Team[] = new Array<Team>();
    if (bracket.left.left.left.left) {
        output = output.concat(GetEliteEightTeams(bracket.left));
    }
    if (bracket.right.right.right.right) {
        output = output.concat(GetEliteEightTeams(bracket.right));
    }
    if (!bracket.left.left.left.left && !bracket.right.right.right.right) {
        output.push(bracket.team);
    }
    return output;
}

function GetFinalFourTeams(bracket: TreeNode): Team[] {
    let output: Team[] = new Array<Team>();
    if (bracket.left.left.left.left.left) {
        output = output.concat(GetFinalFourTeams(bracket.left));
    }
    if (bracket.right.right.right.right.right) {
        output = output.concat(GetFinalFourTeams(bracket.right));
    }
    if (!bracket.left.left.left.left.left && !bracket.right.right.right.right.right) {
        output.push(bracket.team);
    }
    return output;
}

function GetChampionshipTeams(bracket: TreeNode): Team[] {
    let output: Team[] = new Array<Team>();
    output.push(bracket.left.team);
    output.push(bracket.right.team);
    return output;
}

function GetChampion(bracket: TreeNode): Team[] {
    let output: Team[] = new Array<Team>();
    output.push(bracket.team);
    return output;
}

function SimulateAndGiveResult(data, algorith): Result {
    return GiveResults(SimulateBracket(data, algorith));
}

function SimulateBracket(data, algorith): TreeNode {
    var bracketRoot: TreeNode = CreateBlankBracket(data);
    var filledOutUserBracket: TreeNode = FillOutBracket(bracketRoot, algorith);
    var completeCorrectBracket: TreeNode = CreateCompleteCorrectBracket(data);
    var userBracketWithResults: TreeNode = AddResultsToUserBracket(completeCorrectBracket, filledOutUserBracket);
    return userBracketWithResults;
}

function GiveBestResult(result1: Result, result2: Result): Result {
    let result1Total = 0;
    let result2Total = 0;
    for (let i = 0; i < result1.collective.length; i++) {
        result1Total += result1.collective[i] * (i + 1);//Adding in *(i+1) makes each round more valuable
        result2Total += result2.collective[i] * (i + 1);
    }
    if (result1Total >= result2Total) {
        return result1;
    } else {
        return result2;
    }
}

function GiveResults(bracket: TreeNode, result?: Result): Result {
    let output = new Result();
    if (result) {
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
                output.collective[Result.championship]++;
                break;
            case 1:
                output.collective[Result.finalFour]++;
                break;
            case 2:
                output.collective[Result.eliteEight]++;
                break;
            case 3:
                output.collective[Result.sweetSixteen]++;
                break;
            case 4:
                output.collective[Result.secondRound]++;
                break;
            case 5:
                output.collective[Result.firstRound]++;
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
        node.right.team = FillOutCorrectBracket(node.right, data).team;
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

function CreateBlankBracket(data?, depth?: number): TreeNode {
    currentTeam = 0;
    if (!depth) {
        depth = 0;
    }
    if (!data) {
        data = bracketData;
    }
    return CBB(data, depth);
}

function CBB(data, depth: number): TreeNode {
    let root = new TreeNode(depth);
    if (depth < 6) {
        root.left = CBB(data, depth + 1);
        root.left.parent = root;
        root.right = CBB(data, depth + 1);
        root.right.parent = root;
    } else {
        root.team = new Team(seedOrder[(currentTeam) % 16], data.Regions[Math.floor(currentTeam / 16)].teams[seedOrder[(currentTeam) % 16] - 1]);
        root.team.region = data.Regions[Math.floor(currentTeam / 16)].regionName;
        currentTeam++;
    }
    return root;
}

function FillOutBracket(node: TreeNode, algorith): TreeNode {
    if (!node.left.team) {
        node.left.team = _.cloneDeep(FillOutBracket(node.left, algorith).team);
    }
    if (!node.right.team) {
        node.right.team = _.cloneDeep(FillOutBracket(node.right, algorith).team);
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

function HistoricalData(team1: Team, team2: Team): Team {
    let performance = seedPerformance.performances[team1.seed - 1].performance[team2.seed - 1];
    let amplitude = seedPerformance.performances[team1.seed - 1].amplitude[team2.seed - 1];
    let oddsOfWinning = performance;

    if (performance == null) {
        return BestTeamWins(team1, team2);
    } else if (oddsOfWinning > Math.random()) {
        return team1;
    } else {
        return team2;
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

function WorstTeamWins(team1: Team, team2: Team): Team {
    if (team1.seed > team2.seed) {
        return team1;
    } else if (team1.seed == team2.seed && Math.random() > 0.5) {
        return team1;
    } else {
        return team2;
    }
}

function LogXSeedDifference(team1: Team, team2: Team): Team {
    var logBase: number = 2;
    let seedDifference: number = Math.abs(team1.seed - team2.seed);
    let numberOfFlips: number = LogCalculator(logBase, seedDifference);
    let oddsOfWinning: number = Math.pow(0.5, numberOfFlips);
    let lowSeededTeam: Team = (team1.seed <= team2.seed) ? team1 : team2;
    let highSeededTeam: Team = (team1.seed > team2.seed) ? team1 : team2;

    if (oddsOfWinning < Math.random()) {
        return lowSeededTeam;
    } else {
        return highSeededTeam;
    }
}

function LogCalculator(base: number, input: number): number {
    return Math.log(input) / Math.log(base);

}

function FlipACoin(team1: Team, team2: Team): Team {
    if (Math.random() > 0.5) {
        return team1;
    } else {
        return team2;
    }
}