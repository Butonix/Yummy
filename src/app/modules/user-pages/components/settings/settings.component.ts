import { trigger } from '@angular/animations';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { slide, slideReverse, modal, heightAnim } from 'src/tools/animations';
import { IUser, nullUser } from '../../models/users';
import { AuthService } from 'src/app/modules/authentication/services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  animations: [
    trigger('slide', slide()),
    trigger('slideReverse', slideReverse()),
    trigger('modal', modal()),
    trigger('heightAnim', heightAnim()),
  ],
})
export class SettingsComponent {
  @Output() closeEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

  currentPage: number = 0;
  exitModalShow: boolean = false;
  deleteModalShow: boolean = false;
  location = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
  ) {
    this.location = 'https://' + window.location.host;
  }

  @Input() user: IUser = { ...nullUser };

  nightMode = false;

  nightModeEmit(event: boolean) {
    this.nightMode = event;
    if (this.nightMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }

  handleExitModal(event: boolean) {
    if (event) {
      this.authService.logoutUser();
      this.router.navigateByUrl('/');
    }
    this.exitModalShow = false;
  }

  handleDeleteModal(event: boolean) {
    if (event) {
      if (this.user.id) {
        // this.authService.logoutUser(); //выходим из аккаунта
        this.userService.deleteUser(); //удаляем человека
        // this.router.navigateByUrl('/');
      }
    }
    this.deleteModalShow = false;
  }

  clickBackgroundNotContent(elem: Event) {
    //обработка нажатия на фон настроек, но не на блок с настройками
    if (elem.target !== elem.currentTarget) return;
    this.closeEmitter.emit(true);
  }

  showSocialShare = false;
}
