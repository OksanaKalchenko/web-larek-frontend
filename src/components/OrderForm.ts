import { Form } from './common/Form';
import { IEvents } from './base/Events';
import { IOrderForm } from '../types';
import { ensureAllElements } from '../utils/utils';


export class OrderForm extends Form<IOrderForm> {
	protected _paymentButtons: HTMLButtonElement[];

	constructor(container: HTMLFormElement, protected events: IEvents) {
		super(container, events);

		this._paymentButtons = ensureAllElements<HTMLButtonElement>(
			'.button_alt',
			container
		);

		this._paymentButtons.forEach((button) => {
			button.addEventListener('click', () => {
				this.payment = button.name;
				events.emit('payment:change', button);
			});
		});
	}

	set payment(name: string) {
		this._paymentButtons.forEach((button) => {
			if (button.name === name) {
				button.classList.add('button_alt-active');
			} else {
				button.classList.remove('button_alt-active');
			}
		});
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}
}
