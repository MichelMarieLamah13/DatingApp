import { AccountService } from './account.service';
import { Member } from './../_models/member';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { map, take } from 'rxjs/operators';
import { PaginatedResult } from '../_models/pagination';
import { UserParams } from '../_models/userParams';
import { User } from '../_models/user';
import { LikesParams } from '../_models/likesParams';
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  baseUrl = environment.apiUrl
  members: Member[] = [];
  memberCache = new Map();
  user: User;
  userParams: UserParams;
  likesParams: LikesParams;

  constructor(private http: HttpClient, private accountService: AccountService) {
    this.accountService.currentUser$.pipe(take(1)).subscribe(user => {
      this.user = user;
      this.userParams = new UserParams(this.user);
      this.likesParams = new LikesParams();
    })
  }

  getUserParams(): UserParams {
    return this.userParams;
  }

  setUserParams(params: UserParams) {
    this.userParams = params;
  }

  setLikesParams(params: LikesParams) {
    this.likesParams = params;
  }

  getLikesParams(): LikesParams{
    return this.likesParams;
  }



  resetUserParams() {
    this.userParams = new UserParams(this.user);
    return this.userParams;
  }

  getMembers(userParams: UserParams) {
    const key = Object.values(userParams).join('-');
    var response = this.memberCache.get(key)
    if (response) {
      return of(response);
    }

    let params = getPaginationHeaders(userParams.pageNumber, userParams.pageSize);
    params = params.append('minAge', userParams.minAge.toString());
    params = params.append('maxAge', userParams.maxAge.toString());
    params = params.append('gender', userParams.gender);
    params = params.append('orderBy', userParams.orderBy);
    const url = `${this.baseUrl}users`;

    return getPaginatedResult<Member[]>(url, params, this.http).pipe(
      map(response => {
        this.memberCache.set(key, response);
        return response;
      })
    )
  }


  getMember(username: string) {
    const member = [...this.memberCache.values()]
      .reduce((arr, elem) => arr.concat(elem.result), [])
      .find((member: Member) => member.username === username);

    if (member) {
      return of(member);
    }
    return this.http.get<Member>(`${this.baseUrl}users/${username}`)
  }


  updateMember(member: Member) {
    return this.http.put(`${this.baseUrl}users`, member).pipe(
      map(() => {
        const index = this.members.indexOf(member);
        this.members[index] = member;
      })
    );
  }

  setMainPhoto(photoId: number) {
    return this.http.put(`${this.baseUrl}users/set-main-photo/${photoId}`, {});
  }


  deletePhoto(photoId: number) {
    return this.http.delete(`${this.baseUrl}users/delete-photo/${photoId}`);
  }

  addLike(username: string) {
    return this.http.post(`${this.baseUrl}likes/${username}`, {});
  }

  getLikes(likesParams: LikesParams) {
    const key = Object.values(likesParams).join('-');
    var response = this.memberCache.get(key)
    if (response) {
      return of(response);
    }
    let params = getPaginationHeaders(likesParams.pageNumber, likesParams.pageSize);
    params = params.append('predicate', likesParams.predicate);
    return getPaginatedResult<Partial<Member[]>>(`${this.baseUrl}likes`, params, this.http).pipe(
      map(response => {
        this.memberCache.set(key, response);
        return response;
      })
    )
  }


}
