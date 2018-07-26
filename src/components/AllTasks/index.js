import React, { Component } from 'react';
import './styles.css';

import SingleTask from '../SingleTask/index';

import { Input, Icon } from 'antd';

class AllTasks extends Component {
    constructor(props) {
        super(props);
        this.state = {todoItem: '', showArchived: false};
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleArchived = this.handleArchived.bind(this);
    };
    handleSubmit(event) {
        if (this.state.todoItem !== '') {
            this.props.addItem(this.state.todoItem);
            this.setState({todoItem: ''});
        }
        event.preventDefault();
    }
    handleChange(event) {
        this.setState({todoItem: event.target.value});
    }
    handleArchived() {
        if (this.state.showArchived) {
            this.setState({showArchived: false});
        } else {
            this.setState({showArchived: true});
        }
    }
    render() {
        const items = this.props.todoList.slice(0).reverse().map((item) => {
            return (
                <SingleTask item={item} updateItem={this.props.updateItem} editItem={this.props.editItem} archiveItem={this.props.archiveItem} key={item.id} archived={false} />
            );
        });
        let archivedItems = this.props.archivedList.slice(0).reverse().map((item) => {
            return (
                <SingleTask item={item} deleteItem={this.props.deleteItem} key={item.id} archived={true} unarchive={this.props.unarchive} />
            );
        });
        if (!archivedItems.length) {
            archivedItems = (<div className="all-tasks__empty">You didn't archive anything yet...</div>);
        }
        // let items = [];
        // for (let i = this.props.todoList.length - 1; i >= 0; i--) {
        //     items.push(
        //         <SingleTask item={this.props.todoList[i]} updateItem={this.props.updateItem} key={this.props.todoList[i].id} />
        //     );
        // }
        return (
            <section className="all-tasks-wrap">
                <header className="all-tasks__header"><h3>All Tasks</h3></header>
                <form onSubmit={this.handleSubmit} className="all-tasks__input-wrap">
                    {/*<input value={this.state.todoItem} onChange={this.handleChange} />*/}
                    {/*<button type="submit">ADD</button>*/}
                    <Input placeholder={'My next todo...'} value={this.state.todoItem} onChange={this.handleChange} addonAfter={<button className="all-tasks__add-button" type="submit">ADD</button>} />
                </form>
                <ul className="all-tasks__list">
                    {items}
                </ul>
                <header onClick={this.handleArchived} className={"all-tasks__archived-header " + (this.state.showArchived ? 'all-tasks__archived-header--active' : '')}><h3>Archived <Icon className="all-tasks__archived-header__icon" type="down" /></h3></header>
                <ul className={"all-tasks__list all-tasks__list--archived" + (this.state.showArchived ? 'all-tasks__list--active' : '')}>
                    {archivedItems}
                </ul>
            </section>
        );
    }
}

export default AllTasks;