import { Result } from './result';
import { Bracket } from './bracket';
import { Injectable } from '@angular/core';

@Injectable()
export class BracketCheckService {

    constructor() { }

    GetBracketWithResults(correctBracket: Bracket, userBracket: Bracket): Bracket {
        if (userBracket.left.left && userBracket.left.team.correct == null) {
            userBracket.left = this.GetBracketWithResults(correctBracket.left, userBracket.left);
        }
        if (userBracket.right.right && userBracket.right.team.correct == null) {
            userBracket.right = this.GetBracketWithResults(correctBracket.right, userBracket.right);
        }
        if (correctBracket.team.teamName == userBracket.team.teamName) {
            userBracket.team.correct = true;
        } else {
            userBracket.team.correct = false;
        }
        return userBracket;
    }

    GetResults(bracket: Bracket): Result {
        let output = new Result();
        return this.ResultCalculator(bracket, output);
    }

    private ResultCalculator(bracket: Bracket, result: Result): Result {
        if (bracket.left.left) {
            result = this.ResultCalculator(bracket.left, result);
        }
        if (bracket.right.right) {
            result = this.ResultCalculator(bracket.right, result);
        }
        if (bracket.team.correct) {
            switch (bracket.depth) {
                case 0:
                    result.collective[Result.championship]++;
                    break;
                case 1:
                    result.collective[Result.finalFour]++;
                    break;
                case 2:
                    result.collective[Result.eliteEight]++;
                    break;
                case 3:
                    result.collective[Result.sweetSixteen]++;
                    break;
                case 4:
                    result.collective[Result.secondRound]++;
                    break;
                case 5:
                    result.collective[Result.firstRound]++;
                    break;
            }
        }
        return result;
    }
}