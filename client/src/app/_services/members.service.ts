import { Member } from './../_models/member';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  baseUrl = environment.apiUrl
  members: Member[] = [];
  constructor(private http: HttpClient) { }

  getMembers(){
    if(this.members.length>0) return of(this.members);
    return this.http.get<Member[]>(`${this.baseUrl}users`).pipe(
      map(members=>{
        this.members=members
        return this.members
      })
    )
  }
  getMember(username: string){
    const member: Member = this.members.find(m=>m.username===username);
    if(member) return of(member);
    return this.http.get<Member>(`${this.baseUrl}users/${username}`)
  }
  updateMember(member: Member){
    return this.http.put(`${this.baseUrl}users`, member).pipe(
      map(()=>{
        const index = this.members.indexOf(member);
        this.members[index] = member;
      })
    );
  }

  setMainPhoto(photoId:number){
    return this.http.put(`${this.baseUrl}users/set-main-photo/${photoId}`,{});
  }
  deletePhoto(photoId:number){
    return this.http.delete(`${this.baseUrl}users/delete-photo/${photoId}`);
  }
}
