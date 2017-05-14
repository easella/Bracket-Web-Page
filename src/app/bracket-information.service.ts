import { Bracket } from './bracket';
import { Team } from './team';
import { Injectable } from '@angular/core';

@Injectable()
export class BracketInformationService {

    constructor() { }

    GetAllFirstRoundTeams(bracket: Bracket): Team[] {
        let output: Team[] = new Array<Team>();
        if (bracket.left) {
            output = output.concat(this.GetAllFirstRoundTeams(bracket.left));
        }
        if (bracket.right) {
            output = output.concat(this.GetAllFirstRoundTeams(bracket.right));
        }
        if (!bracket.left && !bracket.right) {
            output.push(bracket.team);
        }
        return output;
    }

    GetAllSecondRoundTeams(bracket: Bracket): Team[] {
        let output: Team[] = new Array<Team>();
        if (bracket.left.left) {
            output = output.concat(this.GetAllSecondRoundTeams(bracket.left));
        }
        if (bracket.right.right) {
            output = output.concat(this.GetAllSecondRoundTeams(bracket.right));
        }
        if (!bracket.left.left && !bracket.right.right) {
            output.push(bracket.team);
        }
        return output;
    }

    GetSweetSixteenTeams(bracket: Bracket): Team[] {
        let output: Team[] = new Array<Team>();
        if (bracket.left.left.left) {
            output = output.concat(this.GetSweetSixteenTeams(bracket.left));
        }
        if (bracket.right.right.right) {
            output = output.concat(this.GetSweetSixteenTeams(bracket.right));
        }
        if (!bracket.left.left.left && !bracket.right.right.right) {
            output.push(bracket.team);
        }
        return output;
    }

    GetEliteEightTeams(bracket: Bracket): Team[] {
        let output: Team[] = new Array<Team>();
        if (bracket.left.left.left.left) {
            output = output.concat(this.GetEliteEightTeams(bracket.left));
        }
        if (bracket.right.right.right.right) {
            output = output.concat(this.GetEliteEightTeams(bracket.right));
        }
        if (!bracket.left.left.left.left && !bracket.right.right.right.right) {
            output.push(bracket.team);
        }
        return output;
    }

    GetFinalFourTeams(bracket: Bracket): Team[] {
        let output: Team[] = new Array<Team>();
        if (bracket.left.left.left.left.left) {
            output = output.concat(this.GetFinalFourTeams(bracket.left));
        }
        if (bracket.right.right.right.right.right) {
            output = output.concat(this.GetFinalFourTeams(bracket.right));
        }
        if (!bracket.left.left.left.left.left && !bracket.right.right.right.right.right) {
            output.push(bracket.team);
        }
        return output;
    }

    GetChampionshipTeams(bracket: Bracket): Team[] {
        let output: Team[] = new Array<Team>();
        output.push(bracket.left.team);
        output.push(bracket.right.team);
        return output;
    }

    GetChampion(bracket: Bracket): Team[] {
        let output: Team[] = new Array<Team>();
        output.push(bracket.team);
        return output;
    }
}