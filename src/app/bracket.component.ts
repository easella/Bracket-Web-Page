import { BracketSimulatorService } from './bracket-simulator.service';
import { BracketDataService } from './bracket-data.service';
import { BracketInformationService } from './bracket-information.service';
import { BracketMakerService } from './bracket-maker.service';
import { Component, OnInit } from '@angular/core';
import { Team } from "./team";
import { Http } from "@angular/http";
import 'rxjs/add/operator/map';
import { Bracket } from "./bracket";
import { Algorithm } from './algoritm.enum';

@Component({
    selector: 'bracket',
    templateUrl: './bracket.component.html',
    providers: [
        BracketMakerService,
        BracketInformationService,
        BracketDataService,
        BracketSimulatorService]
})

export class BracketComponent implements OnInit {
    constructor(
        private bracketMakerService: BracketMakerService,
        private bracketInformationService: BracketInformationService,
        private bracketDataService: BracketDataService,
        private bracketSimulatorService: BracketSimulatorService,
        private http: Http){}

    bracketData2015: any;
    bracketData2017: any;
    currentBracketDataInUse: any;


    teams: Team[];
    correctBracket: Bracket;
    tempUserBracket: Bracket;

    ngOnInit() {
        this.bracketDataService.getBracketData('../data/2015.json').subscribe(result => this.bracketData2015 = result);
        this.bracketDataService.getBracketData('../data/2017.json').subscribe(result => {
            this.bracketData2017 = result;
            this.currentBracketDataInUse = this.bracketData2017;
            this.setBracket()
        });
    }

    private setBracket():void {
        this.correctBracket = this.bracketMakerService.CreateCompleteCorrectBracket(this.currentBracketDataInUse);
        let bracket2 = this.bracketMakerService.CreateBlankBracket(this.currentBracketDataInUse);
        this.tempUserBracket = this.bracketSimulatorService.SimulateBracket(bracket2, Algorithm.historicalData);
        console.log(this.tempUserBracket);
        this.teams = this.bracketInformationService.GetAllFirstRoundTeams(this.correctBracket);
    }
}