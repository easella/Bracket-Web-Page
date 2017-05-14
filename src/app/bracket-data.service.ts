import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";

@Injectable()
export class BracketDataService {

    constructor(private http: Http) { }

    getBracketData(file: string): Observable<any> {
        return this.http.get(file).map(result => result.json());
    }
}