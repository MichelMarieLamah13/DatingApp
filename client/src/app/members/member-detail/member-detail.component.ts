import { HubConnection } from '@microsoft/signalr';
import { take } from 'rxjs/operators';
import { AccountService } from './../../_services/account.service';
import { PresenceService } from './../../_services/presence.service';
import { MembersService } from './../../_services/members.service';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Member } from 'src/app/_models/member';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { MessageService } from 'src/app/_services/message.service';
import { Message } from 'src/app/_models/message';
import { User } from 'src/app/_models/user';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit, OnDestroy {

  @ViewChild('memberTabSet', { static: true }) memberTabSet: TabsetComponent;

  member: Member;
  messages: Message[] = []
  galleryOptions: NgxGalleryOptions[] = [];
  galleryImages: NgxGalleryImage[] = [];

  activeTab: TabDirective;

  user: User;


  constructor(private route: ActivatedRoute,
    private messageService: MessageService,
    public presence: PresenceService,
    private accountService: AccountService,
    private router: Router) {

    this.accountService.currentUser$.pipe(take(1)).subscribe(user => {
      this.user = user;
    });

    this.router.routeReuseStrategy.shouldReuseRoute = ()=>false;

  }


  ngOnInit(): void {
    this.loadMemberFromResolver();
  }

  loadMemberFromResolver() {
    this.route.data.subscribe(data => {
      this.member = data.member;
      this.initGallery();
      this.initTabSet();
    })
  }

  initTabSet() {
    this.route.queryParams.subscribe(params => {
      const tabIndex = params.tab;
      tabIndex ? this.selectTab(tabIndex) : this.selectTab(0);
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

  selectTab(id: number) {
    this.memberTabSet.tabs[id].active = true;
  }
  onTabActivated(data: TabDirective) {
    this.activeTab = data;
    if (!this.activeTab.heading || (this.activeTab.heading === 'Messages' && this.messages.length === 0)) {
      this.messageService.createHubConnection(this.user, this.member.username);
    }else{
      this.messageService.stopHubConnection();
    }
  }

  loadMessages() {
    this.messageService.getMessageThread(this.member.username).subscribe(response => {
      this.messages = response;
    })
  }

  ngOnDestroy(): void {
    this.messageService.stopHubConnection();
  }
}
