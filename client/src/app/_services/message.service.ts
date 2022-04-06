import { MessageParams } from './../_models/messageParams';
import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';
import { Message } from '../_models/message';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getMessages(messageParams: MessageParams) {
    let params = getPaginationHeaders(messageParams.pageNumber, messageParams.pageSize);
    params = params.append('container', messageParams.container);
    const url = `${this.baseUrl}messages`
    return getPaginatedResult<Message[]>(url, params, this.http);
  }

  getMessageThread(username: string) {
    const url = `${this.baseUrl}messages/thread/${username}`;
    return this.http.get<Message[]>(url)
  }

  sendMessage(username: string, content: string) {
    const url = `${this.baseUrl}messages`;
    return this.http.post<Message>(url, { recipientUsername: username, content });
  }

  deleteMessage(id:number){
    const url = `${this.baseUrl}messages/${id}`;
    return this.http.delete(url)
  }
}
