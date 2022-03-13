import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'client';
  users: any;
  constructor(private httpClient: HttpClient) {

  }

  ngOnInit() {
    this.getAllUsers();
  }

  getAllUsers() {
    this.httpClient.get('https://localhost:5001/api/Users').subscribe(response => {
      this.users = response;
      console.log(this.users)
    }, errors => {
      console.log(errors)
    })
  }



}
