import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class HttpGameServiceService {

  constructor(private http: HttpClient){ }

  getGameData(){
    return this.http.get()/*Todo*/
  }

}
