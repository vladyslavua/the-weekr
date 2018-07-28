import React, { Component } from 'react';
import './styles.css';

import { Checkbox, Icon, Button, Input } from 'antd';

const { TextArea } = Input;

class SingleTask extends Component {
    constructor(props) {
        super(props);
        this.state = {
            item: props.item,
            active: false,
            editMode: false,
            newText: props.item.text
        };
        this.onChange = this.onChange.bind(this);
        this.deleteTodo = this.deleteTodo.bind(this);
        this.expandItem = this.expandItem.bind(this);
        this.editModeHandler = this.editModeHandler.bind(this);
        this.newTextHandler = this.newTextHandler.bind(this);
        this.saveEditedItem = this.saveEditedItem.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
    };
    componentDidMount() {
        this.setState({newText: this.props.item.text});
        // this.watchForNativeMouseLeave();
    }
    componentDidUpdate() {
        // this.watchForNativeMouseLeave();
    }
    componentWillMount() {
        document.addEventListener('mousedown', this.handleClick, false);
    }
    // watchForNativeMouseLeave() {
    //     document.addEventListener('mouseleave', this.handleHover, false);
    // }
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClick, false);
    }
    handleMouseEnter() {
        // this.props.hoverTodo(this.props.item.id);
    }
    handleMouseLeave() {
        // this.props.hoverTodo(null);
    }
    handleClick = (e) => {
        if (this.node.contains(e.target)) {
            return;
        }
        this.setState({editMode: false});
        this.setState({active: false});
    };
    // handleHover = (e) => {
    //     console.log('london');
    //     this.props.hoverTodo(this.props.item.id);
    // };
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
    }
    expandItem() {
        if (this.state.active) {
            this.setState({active: false});
            this.setState({editMode: false});
        } else {
            this.setState({active: true}, ()=>{
                console.log(this.state.active);
            });
        }
        // this.props.hoverTodo(this.props.item.id);
    }
    editModeHandler() {
        if (this.state.editMode) {
            this.setState({editMode: false});
        } else {
            this.setState({editMode: true});
        }
        this.setState({newText: this.props.item.text});
    }
    saveEditedItem() {
        if (this.state.newText) {
            this.props.editItem(this.props.item.id, this.state.newText);
            this.setState({editMode: false});
            this.setState({newText: this.props.item.text});
        }
    }
    newTextHandler(event) {
        this.setState({newText: event.target.value});
    }
    render() {
        let item = (<span onClick={this.expandItem} className="single-task-list__item-text">{this.props.item.text}</span>);
        if (this.state.editMode) {
            item = (<TextArea onChange={this.newTextHandler} className="single-task-list__item-edit" value={this.state.newText} autosize autoFocus />);
        }
        let extras = (
            <div className="single-task-list__extras">
                <Button onClick={() => this.props.archiveItem(this.props.item.id)} className="pull-right" type="danger">Archive</Button><Button className="pull-right" onClick={this.editModeHandler}>Edit</Button>
            </div>
        );
        if (this.state.editMode) {
            extras = (
                <div className="single-task-list__extras">
                    <Button className="pull-right" onClick={this.saveEditedItem}>Save</Button><Button onClick={this.editModeHandler} className="pull-right">Cancel</Button>
                </div>
            )
        }
        let icon = (
            <Icon onClick={this.expandItem} className="single-task-list__icon pull-right" type="down" />
        );
        if (this.state.active && !this.props.archived) {
            icon = (<Icon onClick={this.expandItem} className="single-task-list__icon pull-right" type="up" />);
        }
        if (this.props.archived) {
            icon = (
                <span className="single-task-list__icon-wrap">
                    <Icon onClick={this.deleteTodo} className="single-task-list__icon single-task-list__icon--delete" type="delete" />
                    <Icon onClick={() => this.props.unarchive(this.props.item.id)} className="single-task-list__icon" type="right" />
                </span>
            );
        }
        return (
            <li onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave} className={"single-task-list " + (this.state.active && !this.props.archived ? 'single-task-list--active' : '')} ref={node => this.node = node}>
                <div className="single-task-list__wrap">
                    <Checkbox onChange={this.onChange} checked={this.state.item.done} />
                    {item}
                    {icon}
                    {extras}
                </div>
            </li>
        );
    }
}

export default SingleTask;