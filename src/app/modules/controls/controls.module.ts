import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from './button/button.component';
import { SelectComponent } from './select/select.component';
import { RouterModule } from '@angular/router';
import { InputComponent } from './input/input.component';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from './modal/modal.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PluralRuDirective } from './directives/plural-ru.directive';
import { ToogleSwitchComponent } from './toogle-switch/toogle-switch.component';
import { ShareButtonsModule } from 'ngx-sharebuttons/buttons';
import { ShareIconsModule } from 'ngx-sharebuttons/icons';
import { SvgIconComponent,provideAngularSvgIcon } from 'angular-svg-icon';

import { SocialButtonComponent } from './social-button/social-button.component';
@NgModule({
  declarations: [
    ButtonComponent,
    SelectComponent,
    InputComponent,
    ModalComponent,
    PageNotFoundComponent,
    PluralRuDirective,
    ToogleSwitchComponent,
    SocialButtonComponent,
    
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ShareButtonsModule,
    ShareIconsModule,
    SvgIconComponent
  ],
  exports: [
    ButtonComponent,
    SelectComponent,
    InputComponent,
    ModalComponent,
    ToogleSwitchComponent,
    PluralRuDirective,
    SocialButtonComponent,
  ],
  providers: [
    provideAngularSvgIcon()
  ]
})
export class ControlsModule {}
