import { Form } from './common/Form';
import { IEvents } from './base/Events';
import { IOrderForm } from '../types';
import { ensureAllElements } from '../utils/utils';


export class OrderForm extends Form<IOrderForm> {
	protected _payment: HTMLButtonElement[];

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._payment = ensureAllElements(`.button_alt`, this.container);

		this._payment.forEach((button) => {
			button.addEventListener('click', () => {
				this.payment = button.name;
				this.onInputChange(`payment`, button.name);
			});
		});
	}
	// устанавливает класс активности на кнопку (active)
	set payment(name: string) {
		this._payment.forEach((button) => {
			this.toggleClass(button, 'button_alt-active', button.name === name);
		});
	}
	// устанавливает значение поля адрес
	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}
}
