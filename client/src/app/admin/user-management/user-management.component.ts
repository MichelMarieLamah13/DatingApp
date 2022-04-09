import { RolesModalComponent } from './../../modals/roles-modal/roles-modal.component';
import { AdminService } from './../../_services/admin.service';
import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/_models/user';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: Partial<User[]> = [];
  bsModalRef: BsModalRef;

  constructor(private adminService: AdminService, private modalService: BsModalService) { }

  ngOnInit(): void {
    this.getUsersWithRoles();
  }

  getUsersWithRoles(){
    this.adminService.getUsersWithRoles().subscribe(users=>{
      this.users = users;
    })
  }

  openRolesModal(user: User){
    const config = {
      class: 'modal-dialog-centered',
      initialState: {
        user,
        roles: this.getRolesArray(user)
      }
    }
    this.bsModalRef = this.modalService.show(RolesModalComponent, config);
    this.bsModalRef.content.updateSelectedRoles.subscribe(values=>{
      const rolesToUpdate = {
        roles: [...values.filter(role=>role.checked).map(el=>el.name)]
      }
      if(rolesToUpdate){
        this.adminService.updateUserRoles(user.username, rolesToUpdate.roles).subscribe(()=>{
          user.roles = [...rolesToUpdate.roles];
        })
      }
    })
  }

  private getRolesArray(user: User){
    const roles: any[] = [];
    const userRoles = user.roles;
    const availableRoles: any[] = [
      {name: 'Admin', value: 'admin'},
      {name: 'Moderator', value: 'moderator'},
      {name: 'Member', value: 'member'},
    ];

    availableRoles.forEach(role=>{
      let isMatched = false;
      for (const userRole of userRoles) {
        if(role.name === userRole){
          isMatched = true;
          break;
        }
      }
      role.checked = isMatched;
      roles.push(role);
    })

    return roles;
  }
}
