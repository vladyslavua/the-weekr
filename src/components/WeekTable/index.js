import React, { Component } from 'react';
import './styles.css';

import DayColumn from '../DayColumn/index';
import indexedDB from '../../indexedDB';

import { notification, Icon } from 'antd';

class WeekTable extends Component {
    constructor(props) {
        super(props);
        this.state = {dayStartWeek: null, items: [], dataLoaded: false, dayOfWeek: null, week: null, currentDay: null, currentWeek: null, hoverId: null, hiddenColumns: [false, false, false, false, false, false, false], navLeft: false, navRight: false, smallScreenActiveDay: null};
        this.getItemForSpecificDay = this.getItemForSpecificDay.bind(this);
        this.addItem = this.addItem.bind(this);
        this.handleTick = this.handleTick.bind(this);
        this.weekBefore = this.weekBefore.bind(this);
        this.weekAfter = this.weekAfter.bind(this);
        this.navLeftHandler = this.navLeftHandler.bind(this);
        this.navRightHandler = this.navRightHandler.bind(this);
        this.goHome = this.goHome.bind(this);
        this.statsBottomHandler = this.statsBottomHandler.bind(this);
    }
    componentDidMount() {
        notification.config({
            placement: 'bottomLeft',
        });
        const now = new Date();
        const week = this.getWeekNumber(new Date());
        this.setState({week: week});
        //current week - not changed
        this.setState({currentWeek: week});
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        const oneDay = 1000 * 60 * 60 * 24;
        let dayofweek = now.getDay();
        if (dayofweek === 0) {
            dayofweek = 7;
        }
        this.setState({dayOfWeek: dayofweek}, () => {
            this.hiddenColumnsHandler();
        });
        //current day of the week - not changed
        this.setState({currentDay: dayofweek});
        const day = Math.floor(diff / oneDay) - dayofweek + 1;
        this.getItems(day, day + 7);
        this.setState({dayStartWeek: day});
        window.addEventListener("resize", (event) => {
            this.hiddenColumnsHandler();
        });
        this.initNewUser();
    }
    initNewUser() {
        indexedDB.table('user')
            .toArray()
            .then((user) => {
                if (user.length === 0) {
                    this.addItem(this.state.dayStartWeek, 1);
                    this.addItem(this.state.dayStartWeek+1, 3);
                    this.addItem(this.state.dayStartWeek+2, 1);
                    this.addItem(this.state.dayStartWeek+3, 3);
                    this.addItem(this.state.dayStartWeek+3, 5);
                    this.addItem(this.state.dayStartWeek+6, 4);
                } else {

                }
            })
    }
    getWeekNumber(d) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
        return weekNo;
    }
    hiddenColumnsHandler() {
        const windowWidth = window.innerWidth;
        if (this.state.smallScreenActiveDay === null) {
            this.setState({smallScreenActiveDay: this.state.dayOfWeek});
        }
        if (windowWidth < 600) {
            let newState = [true, true, true, true, true, true, true];
            newState[this.state.dayOfWeek - 1] = false;
            this.setState({hiddenColumns: newState});
            this.setState({navLeft: true});
            this.setState({navRight: true});
            return;
        }
        if (windowWidth < 800) {
            if (this.state.dayOfWeek < 5) {
                this.setState({hiddenColumns: [false, false, false, false, true, true, true]});
                this.setState({navLeft: false});
                this.setState({navRight: true});
            } else {
                this.setState({hiddenColumns: [true, true, true, false, false, false, false]});
                this.setState({navLeft: true});
                this.setState({navRight: false});
            }
            return;
        }
        if (windowWidth >= 800) {
            this.setState({hiddenColumns: [false, false, false, false, false, false, false]});
            this.setState({navLeft: false});
            this.setState({navRight: false});
        }
    }
    navLeftHandler() {
        const windowWidth = window.innerWidth;
        if (windowWidth < 600) {
            let newState = [true, true, true, true, true, true, true];
            newState[this.state.smallScreenActiveDay - 1 - 1] = false;
            this.setState({hiddenColumns: newState, smallScreenActiveDay: this.state.smallScreenActiveDay - 1}, () => {
                if (this.state.smallScreenActiveDay === 1) {
                    this.setState({navLeft: false});
                }
                if (this.state.smallScreenActiveDay === 6) {
                    this.setState({navRight: true});
                }
            });
            return;
        }
        if (windowWidth < 800) {
            this.setState({hiddenColumns: [false, false, false, false, true, true, true]});
            this.setState({navLeft: false});
            this.setState({navRight: true});
            return;
        }
    }
    navRightHandler() {
        const windowWidth = window.innerWidth;
        if (windowWidth < 600) {
            let newState = [true, true, true, true, true, true, true];
            newState[this.state.smallScreenActiveDay + 1 - 1] = false;
            this.setState({hiddenColumns: newState, smallScreenActiveDay: this.state.smallScreenActiveDay + 1}, () => {
                if (this.state.smallScreenActiveDay === 7) {
                    this.setState({navRight: false});
                }
                if (this.state.smallScreenActiveDay === 2) {
                    this.setState({navLeft: true});
                }
            });
            return;
        }
        if (windowWidth < 800) {
            this.setState({hiddenColumns: [true, true, true, false, false, false, false]});
            this.setState({navLeft: true});
            this.setState({navRight: false});
            return;
        }
    }
    goHome() {
        this.componentDidMount();
    }
    todoHover(id) {
        this.setState({hoverId: id});
    }
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
    calculateCompleted() {
        return this.state.items.filter((value) => value.done === true)
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
    statsBottomHandler() {
        this.props.statsBottomHandler();
    }
    render() {
        if (this.state.dataLoaded) {
            return (
                <div className="week-table-wrap">
                    <header className="week-table__header">
                        <span className="week-table__navigation">
                            <button onClick={this.goHome} className="button-no-decoration"><Icon type="home" /></button>
                            <button onClick={this.statsBottomHandler} className="button-no-decoration"><Icon type="line-chart" /></button>
                            <span className="week-table__stats"><span className="week-table__stats__text"> Progress: </span>{this.calculateCompleted().length} / {this.state.items.length}</span>
                        </span>
                        <span className="week-table__heading">
                            <Icon onClick={this.weekBefore} className="week-table__header__icon" type="left" /> Week {this.state.week} <Icon onClick={this.weekAfter} className="week-table__header__icon" type="right" />
                        </span>
                    </header>
                    <div className="week-table-wrap--flex-container">
                        {!this.state.hiddenColumns[0] ? (<DayColumn className={(this.state.hiddenColumns[0] ? 'week-table__day-column-hidden' : '')} hoverId={this.state.hoverId} dayOfWeek={this.state.dayOfWeek} addItem={this.addItem} weekday={1} day={this.state.dayStartWeek} items={this.getItemForSpecificDay(this.state.dayStartWeek)} todoList={this.props.todoList} handleTick={this.handleTick} />) : ''}
                        {!this.state.hiddenColumns[1] ? (<DayColumn className={(this.state.hiddenColumns[1] ? 'week-table__day-column-hidden' : '')} hoverId={this.state.hoverId} dayOfWeek={this.state.dayOfWeek} addItem={this.addItem} weekday={2} day={this.state.dayStartWeek + 1} items={this.getItemForSpecificDay(this.state.dayStartWeek + 1)} todoList={this.props.todoList} handleTick={this.handleTick} />) : ''}
                        {!this.state.hiddenColumns[2] ? (<DayColumn className={(this.state.hiddenColumns[2] ? 'week-table__day-column-hidden' : '')} hoverId={this.state.hoverId} dayOfWeek={this.state.dayOfWeek} addItem={this.addItem} weekday={3} day={this.state.dayStartWeek + 2} items={this.getItemForSpecificDay(this.state.dayStartWeek + 2)} todoList={this.props.todoList} handleTick={this.handleTick} />) : ''}
                        {!this.state.hiddenColumns[3] ? (<DayColumn className={(this.state.hiddenColumns[3] ? 'week-table__day-column-hidden' : '')} hoverId={this.state.hoverId} dayOfWeek={this.state.dayOfWeek} addItem={this.addItem} weekday={4} day={this.state.dayStartWeek + 3} items={this.getItemForSpecificDay(this.state.dayStartWeek + 3)} todoList={this.props.todoList} handleTick={this.handleTick} />) : ''}
                        {!this.state.hiddenColumns[4] ? (<DayColumn className={(this.state.hiddenColumns[4] ? 'week-table__day-column-hidden' : '')} hoverId={this.state.hoverId} dayOfWeek={this.state.dayOfWeek} addItem={this.addItem} weekday={5} day={this.state.dayStartWeek + 4} items={this.getItemForSpecificDay(this.state.dayStartWeek + 4)} todoList={this.props.todoList} handleTick={this.handleTick} />) : ''}
                        {!this.state.hiddenColumns[5] ? (<DayColumn className={(this.state.hiddenColumns[5] ? 'week-table__day-column-hidden' : '')} hoverId={this.state.hoverId} dayOfWeek={this.state.dayOfWeek} addItem={this.addItem} weekday={6} day={this.state.dayStartWeek + 5} items={this.getItemForSpecificDay(this.state.dayStartWeek + 5)} todoList={this.props.todoList} handleTick={this.handleTick} />) : ''}
                        {!this.state.hiddenColumns[6] ? (<DayColumn className={(this.state.hiddenColumns[6] ? 'week-table__day-column-hidden' : '')} hoverId={this.state.hoverId} dayOfWeek={this.state.dayOfWeek} addItem={this.addItem} weekday={7} day={this.state.dayStartWeek + 6} items={this.getItemForSpecificDay(this.state.dayStartWeek + 6)} todoList={this.props.todoList} handleTick={this.handleTick} />) : ''}
                        <button onClick={this.navRightHandler} className={"button-no-decoration week-table__nav-right " + (!this.state.navRight ? 'hidden' : '')}><Icon type="caret-right" /></button>
                        <button onClick={this.navLeftHandler} className={"button-no-decoration week-table__nav-left " + (!this.state.navLeft ? 'hidden' : '')}><Icon type="caret-left" /></button>
                    </div>
                </div>
            );
        }
        return ('');
    }
}

export default WeekTable;