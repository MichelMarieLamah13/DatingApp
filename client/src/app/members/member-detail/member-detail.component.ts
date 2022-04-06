import { MembersService } from './../../_services/members.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Member } from 'src/app/_models/member';
import { ActivatedRoute } from '@angular/router';
import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { MessageService } from 'src/app/_services/message.service';
import { Message } from 'src/app/_models/message';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {

  @ViewChild('memberTabSet', {static: true}) memberTabSet: TabsetComponent;

  member: Member;
  messages: Message[]=[]
  galleryOptions: NgxGalleryOptions[]=[];
  galleryImages: NgxGalleryImage[]=[];

  activeTab: TabDirective;


  constructor(private memberService: MembersService, private route: ActivatedRoute, private messageService: MessageService) { }

  ngOnInit(): void {
    this.loadMemberFromResolver();
  }

  loadMemberFromResolver(){
    this.route.data.subscribe(data=>{
      this.member = data.member;
      this.initGallery();
      this.initTabSet();
    })
  }

  initTabSet(){
    this.route.queryParams.subscribe(params=>{
      const tabIndex=params.tab;
      tabIndex?this.selectTab(tabIndex): this.selectTab(0);
    })
  }
  initGallery() {
    this.galleryOptions = [
      {
        width: '500px',
        height: '500px',
        imagePercent: 100,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false
      }
    ];

    this.galleryImages = this.getImages();
  }

  getImages(): NgxGalleryImage[] {
    const imageUrls: NgxGalleryImage[] = []
    for (const photo of this.member?.photos) {
      imageUrls.push({
        small: photo?.url,
        medium: photo?.url,
        big: photo?.url
      })
    }
    return imageUrls;
  }

  selectTab(id: number){
    this.memberTabSet.tabs[id].active=true;
  }
  onTabActivated(data: TabDirective){
    this.activeTab = data;
    if(this.activeTab.heading === 'Messages' && this.messages.length===0){
      this.loadMessages();
    }
  }

  loadMessages(){
    this.messageService.getMessageThread(this.member.username).subscribe(response=>{
      this.messages = response;
    })
  }
}
