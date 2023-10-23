import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['../../authentication/common-styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageNotFoundComponent {
  ngOnInit() {
    window.scrollTo(0, 0);
  }
}
