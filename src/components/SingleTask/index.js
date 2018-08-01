import React, { Component } from 'react';
import './styles.css';
import SingleTaskSubtasks from '../SingleTaskSubtasks/index';

import { Checkbox, Icon, Input } from 'antd';

const { TextArea } = Input;

class SingleTask extends Component {
    constructor(props) {
        super(props);
        this.state = {
            item: props.item,
            active: false,
            editMode: false,
            newText: props.item.text,
            subtasksShow: false
        };
        this.onChange = this.onChange.bind(this);
        this.deleteTodo = this.deleteTodo.bind(this);
        this.expandItem = this.expandItem.bind(this);
        this.editModeHandler = this.editModeHandler.bind(this);
        this.newTextHandler = this.newTextHandler.bind(this);
        this.saveEditedItem = this.saveEditedItem.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.starHandler = this.starHandler.bind(this);
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
    //click outside of active task to close it
    handleClick = (e) => {
        if (this.node.contains(e.target)) {
            return;
        }
        this.setState({editMode: false});
        this.setState({active: false});
        this.setState({subtasksShow: false});
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
            this.setState({subtasksShow: false});
        } else {
            this.setState({active: true}, ()=>{
                this.setState({subtasksShow: true});
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
    starHandler() {
        if (!this.props.item.starred) {
            this.props.starHandler(this.props.item.id, true);
        } else {
            this.props.starHandler(this.props.item.id, false);
        }
    }
    render() {
        let item = (<span onClick={this.expandItem} className="single-task-list__item-text">{this.props.item.text}</span>);
        if (this.state.editMode) {
            item = (<TextArea onChange={this.newTextHandler} className="single-task-list__item-edit" value={this.state.newText} autosize autoFocus />);
        }
        // const subtasks = this.state.subtasks.slice(0).reverse().map((item) => {
        //     return (
        //         <li key={item.id}>
        //             <Checkbox onChange={this.onChangeSubtaskCheckbox} checked={item.done} /> {item.text}
        //         </li>
        //     );
        // });
        // let subtasksList = (
        //     <ul className="single-task__subtasks">
        //         {subtasks}
        //     </ul>
        // );
        // let subtasksForm = (
        //     <form onSubmit={this.addSubtask} className="single-task-list__input-wrap">
        //         <Input className="single-task-list__input" placeholder={'Sub-task...'} value={this.state.inputSubtask} onChange={this.handleSubtaskInput} addonAfter={<button className="single-task-list__add-button" type="submit">ADD</button>} />
        //     </form>
        // );
        let starIcon = (<Icon title="Star item" onClick={this.starHandler} className="single-task-list__icon__star single-task-list__icon--delete" type="star-o" />);
        if (this.props.item.starred) {
            starIcon = (<Icon title="Remove star from item" onClick={this.starHandler} className="single-task-list__icon__star single-task-list__icon--delete single-task-list__icon--delete--active" type="star" />);
        }
        let extras = (
            <div className="single-task-list__extras">
                {/*<Button onClick={() => this.props.archiveItem(this.props.item.id)} className="single-task-list__extras__button" type="danger">Archive</Button><Button className="single-task-list__extras__button" onClick={this.editModeHandler}>Edit</Button>*/}
                <button title="Archive item" onClick={() => this.props.archiveItem(this.props.item.id)} className="button-no-decoration single-task-list__extra-buttons single-task-list__extra-buttons--two"><Icon type="inbox" /></button>
                <button title="Edit text" onClick={this.editModeHandler} className="button-no-decoration single-task-list__extra-buttons single-task-list__extra-buttons--one"><Icon type="edit" /></button>
                {this.state.subtasksShow ? (<SingleTaskSubtasks taskId={this.props.item.id}/>) : ''}
            </div>
        );
        if (this.state.editMode) {
            extras = (
                <div className="single-task-list__extras">
                    {/*<Button className="single-task-list__extras__button" onClick={this.saveEditedItem}>Save</Button><Button onClick={this.editModeHandler} className="single-task-list__extras__button">Cancel</Button>*/}
                    <button onClick={this.editModeHandler} className="button-no-decoration single-task-list__extra-buttons single-task-list__extra-buttons--two"><Icon type="minus" /></button>
                    <button onClick={this.saveEditedItem} className="button-no-decoration single-task-list__extra-buttons single-task-list__extra-buttons--one"><Icon type="save" /></button>
                    {this.state.subtasksShow ? (<SingleTaskSubtasks taskId={this.props.item.id}/>) : ''}
                </div>
            )
        }
        let icon = (
            <span className="single-task-list__icon-wrap">
                {starIcon}
                <Icon onClick={this.expandItem} className="single-task-list__icon" type="down" />
            </span>
        );
        if (this.state.active && !this.props.archived) {
            icon = (
                <span className="single-task-list__icon-wrap">
                    {starIcon}
                    <Icon onClick={this.expandItem} className="single-task-list__icon" type="up" />
                </span>
            );
        }
        if (this.props.archived) {
            icon = (
                <span className="single-task-list__icon-wrap">
                    <Icon title="Remove item completely" onClick={this.deleteTodo} className="single-task-list__icon single-task-list__icon--delete" type="delete" />
                    <Icon title="Unarchive item" onClick={() => this.props.unarchive(this.props.item.id)} className="single-task-list__icon" type="right" />
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