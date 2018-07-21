import React, { Component } from 'react';
import './styles.css';

import { Radio, Icon } from 'antd';

class DayColumn extends Component {
    constructor(props) {
        super(props);
        // this.state = {items: []};
        this.addItem = this.addItem.bind(this);
        this.getTick = this.getTick.bind(this);
    };
    componentDidMount() {
        console.log(this.props.items);
    }
    dayName(day) {
        switch(day) {
            case 1:
                return 'Monday';
            case 2:
                return 'Tuesday';
            case 3:
                return 'Wednesday';
            case 4:
                return 'Thursday';
            case 5:
                return 'Friday';
            case 6:
                return 'Saturday';
            case 7:
                return 'Sunday';
            default: return false;
        }
    }
    addItem(id) {
        this.props.addItem(this.props.day, id);
    }
    tickItem(selectedDayTask) {
        this.props.handleTick(selectedDayTask.id);
    }
    getTick(itemId) {
        let res = false;
        this.props.items.map((value) => {
            if (value.taskId === itemId) {
                res = value.done;
                return value.done;
            }
            return false;
        });
        return res;
    }
    render() {
        const items = this.props.todoList.slice(0).reverse().map((item) => {
            const selectedDayTaskArray = this.props.items.filter((value) => value.taskId === item.id);
            let selectedDayTask = null;
            if (selectedDayTaskArray.length > 0) {
                selectedDayTask = selectedDayTaskArray[0];
            }
            return (
                <div className={"day-column__section " + (selectedDayTask ? 'day-column__section--active' : '')} key={item.id}>
                    <Icon onClick={() => this.addItem(item.id)} className="day-column__init-icon day-column__init-icon--plus" type="plus-circle-o" />
                    <Icon onClick={() => this.addItem(item.id)} className="day-column__init-icon day-column__init-icon--minus" type="minus-circle-o" />
                    <Radio className="day-column__radio" onClick={(event) => this.tickItem(selectedDayTask)} checked={this.getTick(item.id)} />
                </div>
            );
        });
        return (
            <div className="day-column-wrap">
                <header className="day-column__header">
                    {this.dayName(this.props.weekday)}
                </header>
                {items}
            </div>
        );
    }
}

export default DayColumn;