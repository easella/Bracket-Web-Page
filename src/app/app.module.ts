import { TeamComponent } from './team.component';

import { BracketComponent } from './bracket.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HttpModule } from "@angular/http";

@NgModule({
    imports: [BrowserModule, HttpModule],
    declarations: [
        AppComponent,
        BracketComponent,
        TeamComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
