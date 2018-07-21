import React, { Component } from 'react';
import './styles.css';

import { Checkbox, Icon } from 'antd';

class SingleTask extends Component {
    constructor(props) {
        super(props);
        this.state = {
            item: props.item
        };
        this.onChange = this.onChange.bind(this);
        this.deleteTodo = this.deleteTodo.bind(this);
    };
    onChange(e) {
        const item = {
            item: this.state.item.text,
            done: !this.state.item.done,
            id: this.state.item.id
        };
        this.setState({ item });
        this.props.updateItem(item.id, item.done);
    }
    deleteTodo() {
        this.props.deleteItem(this.state.item.id);
        console.log('deleted');
    }
    render() {
        return (
            <li className="single-task-list">
                <Checkbox onChange={this.onChange} checked={this.state.item.done} />
                <span className="single-task-list__item-text">{this.props.item.text}</span>
                <Icon onClick={this.deleteTodo} className="single-task-list__delete-icon" type="close" />
            </li>
        );
    }
}

export default SingleTask;