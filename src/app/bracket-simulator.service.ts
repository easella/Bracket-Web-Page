import { BracketDataService } from './bracket-data.service';
import { Team } from './team';
import { Bracket } from './bracket';
import { Injectable } from '@angular/core';
import { Algorithm } from './algoritm.enum';
import * as _ from 'lodash';

@Injectable()
export class BracketSimulatorService {
    constructor(private bracketDataService: BracketDataService) { }

    algorithmUsed: Function;

    seedPerformance: any = this.bracketDataService.getBracketData('../data/2015.json').subscribe(result => this.seedPerformance = result);

    SimulateBracket(input: Bracket, algoritm: Algorithm): Bracket {
        switch (algoritm) {
            case Algorithm.Log2:
                this.algorithmUsed = this.LogXSeedDifference;
                break;
            case Algorithm.historicalData:
                this.algorithmUsed = this.HistoricalData;
                break;
            case Algorithm.bestTeamWins:
                this.algorithmUsed = this.BestTeamWins;
                break;
            case Algorithm.worstTeamWins:
                this.algorithmUsed = this.WorstTeamWins;
                break;
        }
        return this.FillOutBracket(input);
    }

    private FillOutBracket(input: Bracket): Bracket {
        if (!input.left.team) {
            input.left.team = _.cloneDeep(this.FillOutBracket(input.left).team);
        }
        if (!input.right.team) {
            input.right.team = _.cloneDeep(this.FillOutBracket(input.right).team);
        }

        let winningTeam: Team = this.algorithmUsed(input.left.team, input.right.team);
        if (winningTeam == input.left.team) {
            input.team = winningTeam;
            return input;
        } else if (winningTeam == input.right.team) {
            input.team = winningTeam;
            return input;
        } else {
            throw new Error("No teams won");
        }
    }

    private HistoricalData(team1: Team, team2: Team): Team {
        let performance = this.seedPerformance.performances[team1.seed - 1].performance[team2.seed - 1];
        let amplitude = this.seedPerformance.performances[team1.seed - 1].amplitude[team2.seed - 1];
        let oddsOfWinning = performance;

        if (performance == null) {
            return this.BestTeamWins(team1, team2);
        } else if (oddsOfWinning > Math.random()) {
            return team1;
        } else {
            return team2;
        }
    }

    private BestTeamWins(team1: Team, team2: Team): Team {
        if (team1.seed < team2.seed) {
            return team1;
        } else if (team1.seed == team2.seed && Math.random() > 0.5) {
            return team1;
        } else {
            return team2;
        }
    }

    private WorstTeamWins(team1: Team, team2: Team): Team {
        if (team1.seed > team2.seed) {
            return team1;
        } else if (team1.seed == team2.seed && Math.random() > 0.5) {
            return team1;
        } else {
            return team2;
        }
    }

    private LogXSeedDifference(team1: Team, team2: Team): Team {
        var logBase: number = 2;
        let seedDifference: number = Math.abs(team1.seed - team2.seed);
        let numberOfFlips: number = this.LogCalculator(logBase, seedDifference);
        let oddsOfWinning: number = Math.pow(0.5, numberOfFlips);
        let lowSeededTeam: Team = (team1.seed <= team2.seed) ? team1 : team2;
        let highSeededTeam: Team = (team1.seed > team2.seed) ? team1 : team2;

        if (oddsOfWinning < Math.random()) {
            return lowSeededTeam;
        } else {
            return highSeededTeam;
        }
    }

    private LogCalculator(base: number, input: number): number {
        return Math.log(input) / Math.log(base);

    }

    private FlipACoin(team1: Team, team2: Team): Team {
        if (Math.random() > 0.5) {
            return team1;
        } else {
            return team2;
        }
    }
}