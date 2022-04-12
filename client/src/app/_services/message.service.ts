import { BusyService } from './busy.service';
import { BehaviorSubject } from 'rxjs';
import { User } from 'src/app/_models/user';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { MessageParams } from './../_models/messageParams';
import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';
import { Message } from '../_models/message';
import { take } from 'rxjs/operators';
import { Group } from '../_models/group';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  baseUrl = environment.apiUrl;
  hubUrl = environment.hubUrl;
  private hubConnection: HubConnection;
  private messageThreadSource = new BehaviorSubject<Message[]>([]);
  messageThread$ = this.messageThreadSource.asObservable();

  constructor(private http: HttpClient, private busyService: BusyService) { }

  createHubConnection(user: User, otherUsername: string){
    this.busyService.busy();
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${this.hubUrl}message?user=${otherUsername}`, {
        accessTokenFactory: ()=>user.token
      })
      .withAutomaticReconnect()
      .build();

      this.hubConnection.start()
        .catch(error=>console.log(error))
        .finally(()=>this.busyService.idle());

      this.hubConnection.on('ReceiveMessageThread', (messages: Message[])=>{
        this.messageThreadSource.next(messages);
      });

      this.hubConnection.on("NewMessage", message=>{
        this.messageThread$.pipe(take(1)).subscribe(messages=>{
          this.messageThreadSource.next([...messages, message]);
        })
      })

      this.hubConnection.on("UpdatedGroup",(group: Group)=>{
        if(group.connections.some(g=>g.username === otherUsername)){
          this.messageThread$.pipe(take(1)).subscribe(messages=>{
            messages.forEach(message=>{
              if(!message.dateRead){
                message.dateRead = new Date(Date.now())
              }
            });
            this.messageThreadSource.next([...messages]);
          });
        }
      })
  }

  stopHubConnection(){
    if(this.hubConnection){
      this.messageThreadSource.next([]);
      this.hubConnection.stop();
    }
  }

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

  async sendMessage(username: string, content: string) {
    const url = `${this.baseUrl}messages`;
    return this.hubConnection.invoke("SendMessage", { recipientUsername: username, content })
      .catch(error=>console.log(error));
  }

  deleteMessage(id:number){
    const url = `${this.baseUrl}messages/${id}`;
    return this.http.delete(url)
  }
}
