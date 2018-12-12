import React, { Component } from 'react';
import './styles.css';

import DayColumnItem from '../DayColumnItem/index';

class DayColumn extends Component {
    dayName(day) {
        switch(day) {
            case 1:
                return 'Mon';
            case 2:
                return 'Tue';
            case 3:
                return 'Wed';
            case 4:
                return 'Thu';
            case 5:
                return 'Fri';
            case 6:
                return 'Sat';
            case 7:
                return 'Sun';
            default: return false;
        }
    }
    // addItem(id) {
    //     this.props.addItem(this.props.day, id);
    // }
    // tickItem(selectedDayTask) {
    //     this.props.handleTick(selectedDayTask.id);
    // }
    // getTick(itemId) {
    //     let res = false;
    //     this.props.items.map((value) => {
    //         if (value.taskId === itemId) {
    //             res = value.done;
    //             return value.done;
    //         }
    //         return false;
    //     });
    //     return res;
    // }
    render() {
        const items = this.props.todoList.slice(0).reverse().map((item) => {
            const selectedDayTaskArray = this.props.items.filter((value) => (value.taskId + '') === (item.id + ''));
            let selectedDayTask = null;
            if (selectedDayTaskArray.length > 0) {
                selectedDayTask = selectedDayTaskArray[0];
            }
            return (
                <DayColumnItem hoverId={this.props.hoverId} selectedDayTask={selectedDayTask} item={item} key={item.id} addItem={this.props.addItem} day={this.props.day} tickItem={this.props.handleTick}/>
            );
        });
        return (
            <div className="day-column-wrap">
                <header className={"day-column__header " + (this.props.dayOfWeek === this.props.weekday ? 'day-column__header--active' : '')}>
                    {this.dayName(this.props.weekday)}
                </header>
                {items}
            </div>
        );
    }
}

export default DayColumn;