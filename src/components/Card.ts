import { IProduct } from '../types';
import { bem, ensureElement } from '../utils/utils';
import { Component } from './base/Component';

export interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

// Интерфейс для данных карточки товара
interface ICard extends IProduct {
	index?: string; // Индекс карточки
	buttonTitle?: string; // Название кнопки
}

export class Card extends Component<ICard> {
	protected _title: HTMLElement;
	protected _image?: HTMLImageElement;
	protected _description?: HTMLElement;
	protected _category?: HTMLElement;
	protected _price: HTMLElement;
	protected _index?: HTMLElement;
	protected _button?: HTMLButtonElement;

	constructor(
		protected blockName: string,
		container: HTMLElement,
		actions?: ICardActions
	) {
		super(container);

		this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
		this._image = container.querySelector('.card__image');
		this._description = container.querySelector<HTMLElement>(`.${blockName}__text`);
        this._category = container.querySelector(`.${blockName}__category`);
		this._price = ensureElement<HTMLElement>(`.${blockName}__price`, container);
		this._index = container.querySelector<HTMLElement>(`.basket__item-index`);
		this._button = container.querySelector('.card__button');

		if (actions?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', actions.onClick);
			} else {
				container.addEventListener('click', actions.onClick);
			}
		}
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	get title(): string {
		return this._title.textContent || '';
	}

	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	set description(value: string) {
		this.setText(this._description, value);
	}

	set category(value: string) {
		this.setText(this._category, value);
		this._category.className = this._category.className.split(' ')[0]
		switch (value) {
			case 'другое':
				this._category.classList.add(bem(this.blockName, 'category', 'other').name);
				break;
			case 'софт-скил':
				this._category.classList.add(bem(this.blockName, 'category', 'soft').name);
				break;
			case 'хард-скил':
				this._category.classList.add(bem(this.blockName, 'category', 'hard').name);
				break;
			case 'дополнительное':
				this._category.classList.add(bem(this.blockName, 'category', 'additional').name);
				break;
			case 'кнопка':
				this._category.classList.add(bem(this.blockName, 'category', 'button').name);
				break;
		}
	}

    get category(): string {
        return this._category.textContent || '';
    }

	set price(value: number | null) {
		if (value === null) {
			this.setText(this._price, 'Бесценно');
			this.setDisabled(this._button, true);
		} else {
			this.setText(this._price, `${value} синапсов`);
		}
	}

	set index(value: string) {
		this.setText(this._index, value);
	}

    //проверяет цену и делает кнопку покупки неактивной если цена не указана
    disablePriceButton () {
        this.setDisabled(this._button, true);
    }

    set buttonTitle (value: string) {
        this.setText(this._button, value);
    }
};