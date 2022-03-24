import { environment } from './../../environments/environment';
import { User } from './../_models/user';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {map} from 'rxjs/operators'
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl = environment.apiUrl;
  private currentSource = new ReplaySubject<User>(1);
  currentUser$ = this.currentSource.asObservable();
  constructor(private http: HttpClient) { }
  login(model: any){
    return this.http.post(this.baseUrl+'account/login',model).pipe(
      map((response: User)=>{
        const user = response;
        if(user){
          localStorage.setItem('user',JSON.stringify(user));
          this.setCurrentUser(user);
        }
      })
    );
  }

  setCurrentUser(user:User){
    this.currentSource.next(user)
  }

  logout(){
    localStorage.removeItem('user');
    this.setCurrentUser(null);
  }

  register(model: any){
    return this.http.post(`${this.baseUrl}account/register`, model).pipe(
      map((user:User)=>{
        if(user){
          localStorage.setItem('user', JSON.stringify(user));
          this.setCurrentUser(user);
        }
        return user;
      })
    )
  }
}
