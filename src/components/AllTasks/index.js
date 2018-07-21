import React, { Component } from 'react';
import './styles.css';

import SingleTask from '../SingleTask/index';

import { Input } from 'antd';

class AllTasks extends Component {
    constructor(props) {
        super(props);
        this.state = {todoItem: ''};
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
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
    render() {
        const items = this.props.todoList.slice(0).reverse().map((item) => {
            return (
                <SingleTask item={item} updateItem={this.props.updateItem} deleteItem={this.props.deleteItem} key={item.id} />
            );
        });
        // let items = [];
        // for (let i = this.props.todoList.length - 1; i >= 0; i--) {
        //     items.push(
        //         <SingleTask item={this.props.todoList[i]} updateItem={this.props.updateItem} key={this.props.todoList[i].id} />
        //     );
        // }
        return (
            <section className="all-tasks-wrap">
                <form onSubmit={this.handleSubmit} className="all-tasks__input-wrap">
                    {/*<input value={this.state.todoItem} onChange={this.handleChange} />*/}
                    {/*<button type="submit">ADD</button>*/}
                    <Input placeholder={'My next todo...'} value={this.state.todoItem} onChange={this.handleChange} addonAfter={<button type="submit">ADD</button>} />
                </form>
                <ul className="all-tasks__list">
                    {items}
                </ul>
            </section>
        );
    }
}

export default AllTasks;