import { Component, computed, input } from '@angular/core';
import { IconDirective } from '@coreui/icons-angular';

@Component({
  selector: 'app-inbox-message',
  templateUrl: './inbox-message.component.html',
  styleUrls: ['./inbox-message.component.scss'],
  imports: [IconDirective],
  host: {
    '[class]': 'hostClasses()'
  }
})
export class InboxMessageComponent {

  readonly read = input<boolean>();
  readonly description = input('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.');
  readonly title = input('Lorem ipsum dolor sit amet');
  readonly from = input('Lukasz Holeczek');
  readonly date = input('Today, 3:47 PM');

  readonly hostClasses = computed(() => {
    const read = this.read();
    return {
      'message': true,
      'message-read': read,
      'd-flex': true,
      'mb-3': true,
      'text-body-emphasis': !read,
      'text-body-secondary': read,
      'text-decoration-none': true
    };
  })
}
