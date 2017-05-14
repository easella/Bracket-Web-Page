import { BracketDataService } from './bracket-data.service';
import { BracketInformationService } from './bracket-information.service';
import { BracketMakerService } from './bracket-maker.service';
import { Component, OnInit } from '@angular/core';
import { Team } from "./team";
import { Http } from "@angular/http";
import 'rxjs/add/operator/map';
import { Bracket } from "./bracket";

@Component({
    selector: 'bracket',
    templateUrl: './bracket.component.html',
    providers: [BracketMakerService, BracketInformationService, BracketDataService]
})

export class BracketComponent implements OnInit {
    constructor(
        private bracketMakerService: BracketMakerService,
        private bracketInformationService: BracketInformationService,
        private bracketDataService: BracketDataService,
        private http: Http) { }

    bracketData2015: any;
    bracketData2017: any;
    currentBracketDataInUse: any;


    teams: Team[];
    correctBracket: Bracket;

    ngOnInit() {
        this.bracketDataService.getBracketData('../data/2015.json').subscribe(result => this.bracketData2015 = result);
        this.bracketDataService.getBracketData('../data/2017.json').subscribe(result => {
            this.bracketData2017 = result;
            this.currentBracketDataInUse = this.bracketData2017;
            this.setBracket()
        });
    }

    private setBracket():void {
        let bracket = this.bracketMakerService.CreateBlankBracket(this.currentBracketDataInUse);
        this.correctBracket = this.bracketMakerService.FillOutCorrectBracket(bracket, this.currentBracketDataInUse);
        this.teams = this.bracketInformationService.GetAllFirstRoundTeams(bracket);
    }
}