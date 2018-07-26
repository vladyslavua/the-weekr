import React, { Component } from 'react';
import './styles.css';

import DayColumn from '../DayColumn/index';
import indexedDB from '../../indexedDB';

import { notification, Icon } from 'antd';

class WeekTable extends Component {
    constructor(props) {
        super(props);
        this.state = {dayStartWeek: null, items: [], dataLoaded: false, dayOfWeek: null, week: null, currentDay: null, currentWeek: null};
        this.getItemForSpecificDay = this.getItemForSpecificDay.bind(this);
        this.addItem = this.addItem.bind(this);
        this.handleTick = this.handleTick.bind(this);
        this.weekBefore = this.weekBefore.bind(this);
        this.weekAfter = this.weekAfter.bind(this);
    }
    componentDidMount() {
        notification.config({
            placement: 'bottomLeft',
        });
        const now = new Date();
        const onejan = new Date(now.getFullYear(), 0, 1);
        const week = Math.ceil( (((now - onejan) / 86400000) + onejan.getDay() + 1) / 7 );
        this.setState({week: week});
        //current week - not changed
        this.setState({currentWeek: week});
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayofweek = now.getDay();
        this.setState({dayOfWeek: dayofweek});
        //current day of the week - not changed
        this.setState({currentDay: dayofweek});
        const day = Math.floor(diff / oneDay) - dayofweek + 1;
        this.getItems(day, day + 7);
        this.setState({dayStartWeek: day});
    }
    // todoHover(id) {
    //     console.log(id);
    // }
    getItems(startDay, endDay) {
        indexedDB.table('days')
            .where('day').inAnyRange([[startDay, endDay]])
            .toArray()
            .then((items) => {
                this.setState({items: items});
                this.setState({dataLoaded: true});
            })
            .catch(() => {
                notification.open({
                    message: 'Error',
                    description: 'Something went wrong. Please refresh the browser.',
                });
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
                })
                .catch(() => {
                    notification.open({
                        message: 'Error',
                        description: 'Something went wrong. Please refresh the browser.',
                    });
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
                })
                .catch(() => {
                    notification.open({
                        message: 'Error',
                        description: 'Something went wrong. Please refresh the browser.',
                    });
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
            })
            .catch(() => {
                notification.open({
                    message: 'Error',
                    description: 'Something went wrong. Please refresh the browser.',
                });
            });
    }
    weekBefore() {
        this.setState((prevState, props) => ({
            week: prevState.week - 1
        }), () => {
            if (this.state.currentWeek === this.state.week) {
                this.setState({dayOfWeek: this.state.currentDay});
            }
        });
        this.setState((prevState, props) => ({
            dayStartWeek: prevState.dayStartWeek - 7
        }),() => {
            this.getItems(this.state.dayStartWeek, this.state.dayStartWeek + 7);
        });
        this.setState({dayOfWeek: null});
    }
    weekAfter() {
        this.setState((prevState, props) => ({
            week: prevState.week + 1
        }), () => {
            if (this.state.currentWeek === this.state.week) {
                this.setState({dayOfWeek: this.state.currentDay});
            }
        });
        this.setState((prevState, props) => ({
            dayStartWeek: prevState.dayStartWeek + 7
        }),() => {
            this.getItems(this.state.dayStartWeek, this.state.dayStartWeek + 7);
        });
        this.setState({dayOfWeek: null});
    }
    render() {
        if (this.state.dataLoaded) {
            return (
                <div className="week-table-wrap">
                    <header className="week-table__header">
                        {/*<Icon type="home" />*/}
                        <Icon onClick={this.weekBefore} className="week-table__header__icon" type="left" /> Week {this.state.week} <Icon onClick={this.weekAfter} className="week-table__header__icon" type="right" />
                    </header>
                    <div className="week-table-wrap--flex-container">
                        <DayColumn dayOfWeek={this.state.dayOfWeek} addItem={this.addItem} weekday={1} day={this.state.dayStartWeek} items={this.getItemForSpecificDay(this.state.dayStartWeek)} todoList={this.props.todoList} handleTick={this.handleTick} />
                        <DayColumn dayOfWeek={this.state.dayOfWeek} addItem={this.addItem} weekday={2} day={this.state.dayStartWeek + 1} items={this.getItemForSpecificDay(this.state.dayStartWeek + 1)} todoList={this.props.todoList} handleTick={this.handleTick} />
                        <DayColumn dayOfWeek={this.state.dayOfWeek} addItem={this.addItem} weekday={3} day={this.state.dayStartWeek + 2} items={this.getItemForSpecificDay(this.state.dayStartWeek + 2)} todoList={this.props.todoList} handleTick={this.handleTick} />
                        <DayColumn dayOfWeek={this.state.dayOfWeek} addItem={this.addItem} weekday={4} day={this.state.dayStartWeek + 3} items={this.getItemForSpecificDay(this.state.dayStartWeek + 3)} todoList={this.props.todoList} handleTick={this.handleTick} />
                        <DayColumn dayOfWeek={this.state.dayOfWeek} addItem={this.addItem} weekday={5} day={this.state.dayStartWeek + 4} items={this.getItemForSpecificDay(this.state.dayStartWeek + 4)} todoList={this.props.todoList} handleTick={this.handleTick} />
                        <DayColumn dayOfWeek={this.state.dayOfWeek} addItem={this.addItem} weekday={6} day={this.state.dayStartWeek + 5} items={this.getItemForSpecificDay(this.state.dayStartWeek + 5)} todoList={this.props.todoList} handleTick={this.handleTick} />
                        <DayColumn dayOfWeek={this.state.dayOfWeek} addItem={this.addItem} weekday={7} day={this.state.dayStartWeek + 6} items={this.getItemForSpecificDay(this.state.dayStartWeek + 6)} todoList={this.props.todoList} handleTick={this.handleTick} />
                    </div>
                </div>
            );
        }
        return ('');
    }
}

export default WeekTable;