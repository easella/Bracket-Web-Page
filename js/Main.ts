import { Team } from './../src/app/team';
import { Result } from './../src/app/result';
import { Bracket } from './../src/app/bracket';

//Main
var seedPerformance = require('../Data/seedPerformance.json');
var bracketData2015 = require('../Data/2015.json');
var bracketData2017 = require('../Data/2017.json');
var _ = require('lodash');
var currentTeam = 0;
var seedOrder: number[] = [1, 16, 8, 9, 5, 12, 4, 13, 6, 11, 3, 14, 7, 10, 2, 15];
var statText: string[] = ["First Round: ", "Second Round: ", "Sweet Sixteen: ", "Elite Eight: ", "Final Four: ", "Championship: "];
var numberOfSimulations = 1000;
var algorithmToUse = HistoricalData;
var scoringSystemToUse = PointPerRound;
var bracketData = bracketData2015;

window.onload = () => {
    document.getElementById("simulateButton").onclick = function() {SimulateButtonClick()};
    SimulateAndAddBestToDOM();
};

//EndMain

function SimulateAndAddBestToDOM() {
    let bestResult: Result = new Result();
    let bestBracket: Bracket;
    let totalResult: Result = new Result();
    for (let i = 0; i < numberOfSimulations; i++) {
        let tempBracket: Bracket = SimulateBracket(bracketData, algorithmToUse);
        let tempResult: Result = GiveResults(tempBracket);
        for (let j = 0; j < tempResult.collective.length; j++) {
            totalResult.collective[j] += tempResult.collective[j];
        }
        if (scoringSystemToUse(bestResult, tempResult) == tempResult) {
            bestResult = tempResult;
            bestBracket = tempBracket;
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
    SetScoringSystem((<HTMLInputElement>document.getElementById('scoringSelect')).value);
    SetBracketYear((<HTMLInputElement>document.getElementById('yearSelect')).value);
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

function SetBracketYear(input: string) {
    if (input == "2015") {
        bracketData = bracketData2015;
    } else if (input == "2017") {
        bracketData = bracketData2017;
    } else {
        console.log("Wrong Year Chosen");
    }
}

function SetScoringSystem(input: string) {
    if (input == "game") {
        scoringSystemToUse = PointPerGame;
    } else if (input == "round") {
        scoringSystemToUse = PointPerRound;
    } else {
        console.log("Wrong Scoring System Used");
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

function AddBracketToDOM(bracket: Bracket) {
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
    let regionHeaders = document.querySelectorAll(".region-heading:not(.final-four");
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
    AddRegionHeaders(bracket, regionHeaders);
}

function AddRegionHeaders(bracket: Bracket, regionHeadings: NodeListOf<Element>) {
    let regionNames: string[] = new Array<string>();
    regionNames.push(bracket.left.left.team.region);
    regionNames.push(bracket.left.right.team.region);
    regionNames.push(bracket.right.left.team.region);
    regionNames.push(bracket.right.right.team.region);
    for (let i = 0; i < 4; i++) {
        regionHeadings[i].textContent = regionNames[i];
    }
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

function SimulateAndGiveResult(data, algorith): Result {
    return GiveResults(SimulateBracket(data, algorith));
}

function SimulateBracket(data, algorith): Bracket {
    var bracketRoot: Bracket = CreateBlankBracket(data);
    var filledOutUserBracket: Bracket = FillOutBracket(bracketRoot, algorith);
    var completeCorrectBracket: Bracket = CreateCompleteCorrectBracket(data);
    var userBracketWithResults: Bracket = AddResultsToUserBracket(completeCorrectBracket, filledOutUserBracket);
    return userBracketWithResults;
}

function PointPerRound(result1: Result, result2: Result): Result {
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

function PointPerGame(result1: Result, result2: Result): Result {
    let result1Total = 0;
    let result2Total = 0;
    for (let i = 0; i < result1.collective.length; i++) {
        result1Total += result1.collective[i];
        result2Total += result2.collective[i];
    }
    if (result1Total >= result2Total) {
        return result1;
    } else {
        return result2;
    }
}

function GiveResults(bracket: Bracket, result?: Result): Result {
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

function AddResultsToUserBracket(correctBracket: Bracket, userBracket: Bracket): Bracket {
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

function CreateCompleteCorrectBracket(data): Bracket {
    var blankBracket: Bracket = CreateBlankBracket(data);
    var finishedBracket: Bracket = FillOutCorrectBracket(blankBracket, data);
    return finishedBracket;
}