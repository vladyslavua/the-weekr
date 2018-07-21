import React, { Component } from 'react';
import './styles.css';

import DayColumn from '../DayColumn/index';
import indexedDB from '../../indexedDB';

class WeekTable extends Component {
    constructor(props) {
        super(props);
        this.state = {dayStartWeek: null, items: [], dataLoaded: false};
        this.getItemForSpecificDay = this.getItemForSpecificDay.bind(this);
        this.addItem = this.addItem.bind(this);
        this.handleTick = this.handleTick.bind(this);
    }
    componentDidMount() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayofweek = now.getDay();
        const day = Math.floor(diff / oneDay) - dayofweek + 1;
        this.getItems(day, day + 7);
        this.setState({dayStartWeek: day});
    }
    getItems(startDay, endDay) {
        indexedDB.table('days')
            .where('day').inAnyRange([[startDay, endDay]])
            .toArray()
            .then((items) => {
                this.setState({items: items});
                this.setState({dataLoaded: true});
            });
    }
    getItemForSpecificDay(day) {
        return this.state.items.filter((value) => value.day === day);
    }
    addItem(day, taskId) {
        if (this.state.items.some((value) => value.day === day && value.taskId === taskId)) {
            let newArray = [...this.state.items];
            let singleItem = newArray.filter((item) => item.taskId === taskId && item.day === day);
            indexedDB.table('days')
                .delete(singleItem[0].id)
                .then(() => {
                    newArray = newArray.filter(function(item) {
                        return item.day !== day || item.taskId !== taskId;
                    });
                    this.setState({items: newArray});
                });
        } else {
            const item = {
                day: day,
                taskId: taskId,
                active: true,
                done: false
            };
            indexedDB.table('days')
                .add(item)
                .then((id) => {
                    item.id = id;
                    this.setState({items: [...this.state.items, item]});
                });
        }

    }
    handleTick(id) {
        const index = this.state.items.map((e) => e.id).indexOf(id);
        const newList = this.state.items.map((item) => Object.assign({}, item));
        newList[index].done = !newList[index].done;
        this.setState({ items: newList });
        indexedDB.table('days')
            .update(id, { done: newList[index].done })
            .then(() => {
            });
    }
    render() {
        if (this.state.dataLoaded) {
            return (
                <div className="week-table-wrap week-table-wrap--flex-container">
                    <DayColumn addItem={this.addItem} weekday={1} day={this.state.dayStartWeek} items={this.getItemForSpecificDay(this.state.dayStartWeek)} todoList={this.props.todoList} handleTick={this.handleTick} />
                    <DayColumn addItem={this.addItem} weekday={2} day={this.state.dayStartWeek + 1} items={this.getItemForSpecificDay(this.state.dayStartWeek + 1)} todoList={this.props.todoList} handleTick={this.handleTick} />
                    <DayColumn addItem={this.addItem} weekday={3} day={this.state.dayStartWeek + 2} items={this.getItemForSpecificDay(this.state.dayStartWeek + 2)} todoList={this.props.todoList} handleTick={this.handleTick} />
                    <DayColumn addItem={this.addItem} weekday={4} day={this.state.dayStartWeek + 3} items={this.getItemForSpecificDay(this.state.dayStartWeek + 3)} todoList={this.props.todoList} handleTick={this.handleTick} />
                    <DayColumn addItem={this.addItem} weekday={5} day={this.state.dayStartWeek + 4} items={this.getItemForSpecificDay(this.state.dayStartWeek + 4)} todoList={this.props.todoList} handleTick={this.handleTick} />
                    <DayColumn addItem={this.addItem} weekday={6} day={this.state.dayStartWeek + 5} items={this.getItemForSpecificDay(this.state.dayStartWeek + 5)} todoList={this.props.todoList} handleTick={this.handleTick} />
                    <DayColumn addItem={this.addItem} weekday={7} day={this.state.dayStartWeek + 6} items={this.getItemForSpecificDay(this.state.dayStartWeek + 6)} todoList={this.props.todoList} handleTick={this.handleTick} />
                </div>
            );
        }
        return ('');
    }
}

export default WeekTable;