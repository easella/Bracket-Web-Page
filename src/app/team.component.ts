import { Team } from './team';
import { Component, OnInit, Input } from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'team',
    templateUrl: 'team.component.html',
    styleUrls: ['team.component.css']
})

export class TeamComponent implements OnInit {
    constructor() { }

    @Input() team: Team;
    @Input() index: number;

    ngOnInit() {
     }
}