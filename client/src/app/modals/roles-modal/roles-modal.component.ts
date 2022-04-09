import { NgForm } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, Input, OnInit, EventEmitter } from '@angular/core';
import { User } from 'src/app/_models/user';

@Component({
  selector: 'app-roles-modal',
  templateUrl: './roles-modal.component.html',
  styleUrls: ['./roles-modal.component.css']
})
export class RolesModalComponent implements OnInit {
  @Input() updateSelectedRoles = new EventEmitter<any[]>();
  user: User;
  roles: any[]=[];

  rolesForm: NgForm;

  constructor(public bsModalRef: BsModalRef) {}

  ngOnInit() {
    console.log(this.user);
  }

  updateRoles(){
    this.updateSelectedRoles.emit(this.roles);
    this.bsModalRef.hide();
  }

}
