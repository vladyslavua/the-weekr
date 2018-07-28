import React, { Component } from 'react';
import './styles.css';

import { Radio, Icon } from 'antd';

class DayColumnItem extends Component {
	render() {
		let radio = '';
		if (this.props.selectedDayTask) {
			radio = (
				<Radio className="day-column__radio" onClick={() => this.props.tickItem(this.props.selectedDayTask.id)} checked={this.props.selectedDayTask.done} />
			);
		}
		return (
			<div className={"day-column__section " + (this.props.selectedDayTask ? 'day-column__section--active ' : '') + (this.props.hoverId === this.props.item.id ? 'day-column__section--hovered' : '')}>
				<Icon onClick={() => this.props.addItem(this.props.day, this.props.item.id)} className="day-column__init-icon day-column__init-icon--plus" type="plus-circle-o" />
				<Icon onClick={() => this.props.addItem(this.props.day, this.props.item.id)} className="day-column__init-icon day-column__init-icon--minus" type="minus-circle-o" />
				{radio}
			</div>
		);
	}
}

export default DayColumnItem;