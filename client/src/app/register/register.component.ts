import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from './../_services/account.service';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegister = new EventEmitter();
  maxDate: Date;
  registerForm: FormGroup;
  validationErrors: string[]=[];
  constructor(private accountService: AccountService,
    private toaster: ToastrService,
    private fb: FormBuilder,
    private router: Router) { }

  ngOnInit(): void {
    this.initializeForm();
    this.maxDate = new Date();
    this.maxDate.setFullYear(this.maxDate.getFullYear()-18)
  }

  initializeForm(){
    this.registerForm = this.fb.group({
      gender: ['male'],
      knownAs: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
      confirmPassword: ['', [Validators.required, this.matchValues("password")]]
    })
    this.registerForm.controls.password.valueChanges.subscribe(()=>{
      this.registerForm.controls.confirmPassword.updateValueAndValidity();
    })
  }

  get country(){
    return this.registerForm.get('country');
  }
  get city(){
    return this.registerForm.get('city');
  }
  get dateOfBirth(){
    return this.registerForm.get('dateOfBirth');
  }
  get knownAs(){
    return this.registerForm.get('knownAs');
  }
  get gender(){
    return this.registerForm.get('gender');
  }
  get username(){
    return this.registerForm.get('username');
  }
  get password(){
    return this.registerForm.get('password');
  }
  get confirmPassword(){
    return this.registerForm.get('confirmPassword');
  }

  matchValues(matchTo: string): ValidatorFn{
    return (control: AbstractControl)=>{
      return control?.value === control?.parent?.controls[matchTo]?.value?null:{isMatching: true};
    }
  }
  register() {
    if(this.registerForm.valid){
      this.accountService.register(this.registerForm.value).subscribe(
        response => {
          this.router.navigateByUrl('/members');
        },
        error=>{
          this.validationErrors = error
        })
    }else{
      this.toaster.error("Make sure all the fields are filled", "Validation Error");
    }
  }

  cancel() {
    this.cancelRegister.emit(false);
  }
}
