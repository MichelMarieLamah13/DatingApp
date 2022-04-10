import { ConfirmService } from './../_services/confirm.service';
import { MessageService } from './../_services/message.service';
import { UserParams } from './../_models/userParams';
import { Component, OnInit } from '@angular/core';
import { Message } from '../_models/message';
import { Pagination } from '../_models/pagination';
import { MessageParams } from '../_models/messageParams';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  messages: Message[]=[];
  pagination: Pagination;
  messageParams: MessageParams;

  loading=false;
  constructor(private messageService: MessageService, private confirmService: ConfirmService) {
    this.messageParams = new MessageParams();
  }

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages() {
    this.loading=true;
    this.messageService.getMessages(this.messageParams).subscribe(response => {
      this.messages = response.result;
      this.pagination = response.pagination;
      this.loading=false;
    })
  }

  pageChanged(event: any) {
    if (this.messageParams.pageNumber != event.page) {
      this.messageParams.pageNumber = event.page;
      this.loadMessages();
    }
  }

  deleteMessage(event:any, id:number){
    event.stopPropagation();
    this.confirmService.confirm('Confirm delete message','This can not be undone').subscribe(result=>{
      if(result){
        this.messageService.deleteMessage(id).subscribe(()=>{
          const msgIdx = this.messages.findIndex(m=>m.id==id)
          this.messages.splice(msgIdx, 1);

        })
      }
    })
  }

}
