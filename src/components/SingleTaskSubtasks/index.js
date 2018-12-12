import React, { Component } from 'react';
import './styles.css';
import indexedDB from '../../indexedDB';

import app from 'firebase/app';

import { Checkbox, Input, notification, Icon } from 'antd';

class SingleTaskSubtasks extends Component {
	constructor(props) {
		super(props);
		this.state = {
			inputSubtask: '',
			subtasks: []
		};
		this.getSubtasks = this.getSubtasks.bind(this);
		this.addSubtask = this.addSubtask.bind(this);
		this.handleSubtaskInput = this.handleSubtaskInput.bind(this);
	};

	componentDidMount() {
		this.getSubtasks();
	}

	getSubtasks() {
		if (this.props.authorised) {
			if (this.props.taskId) {
				let subtasks = app.database().ref('users/' + this.props.authorised + '/subtasks').orderByChild('taskId').equalTo(this.props.taskId + '');
				subtasks.on('value', function(snapshot) {
					let data = snapshot.val();
					if (!data) {
						this.setState({ subtasks: [] });
						return;
					}
					let subtasksList = Object.entries(data).map(([key, value]) => {
						let res = value;
						if (res.id === undefined) {
							res.id = key;
						}
						return res;
					});
					this.setState({ subtasks: subtasksList.reverse() });
				}.bind(this));
			}
		} else {
			indexedDB.table('subtasks')
				.where('taskId').equals(this.props.taskId)
				.reverse()
				.toArray()
				.then((subtasks) => {
					this.setState({ subtasks });
				})
				.catch(() => {
					notification.open({
						message: 'Error',
						description: 'Something went wrong. Please refresh the browser.',
					});
				});
		}
	}
	addSubtask(event) {
		event.preventDefault();
		if (this.state.inputSubtask !== '') {
			this.setState({inputSubtask: ''});
			let todo = {
				text: this.state.inputSubtask,
				done: false,
				starred: false,
				taskId: this.props.taskId
			};
			if (this.props.authorised) {
				todo.taskId = todo.taskId + '';
				app.database().ref('users/' + this.props.authorised + '/subtasks/').push().set(todo);
			} else {
				indexedDB.table('subtasks')
					.add(todo)
					.then((id) => {
						const newList = [Object.assign({}, todo, { id }), ...this.state.subtasks];
						this.setState({ subtasks: newList });
					})
					.catch(() => {
						notification.open({
							message: 'Error',
							description: 'Something went wrong. Please refresh the browser.',
						});
					});
			}
		}
	}
	deleteSubtask(id) {
		if (this.props.authorised) {
			app.database().ref('users/' + this.props.authorised + '/subtasks/' + id).remove();
		} else {
			indexedDB.table('subtasks')
				.delete(id)
				.then(() => {
					const newList = this.state.subtasks.filter((subtask) => subtask.id !== id);
					this.setState({ subtasks: newList });
				})
				.catch((err) => {
					notification.open({
						message: 'Error',
						description: 'Something went wrong. Please refresh the browser.',
					});
				});
		}
	}
	tickUntickItem(id, done) {
		if (this.props.authorised) {
			app.database().ref('users/' + this.props.authorised + '/subtasks/' + id + '/done').set(done);
		} else {
			indexedDB.table('subtasks')
				.update(id, { done })
				.then(() => {

				})
				.catch(() => {
					notification.open({
						message: 'Error',
						description: 'Something went wrong. Please refresh the browser.',
					});
				});
		}
	}
	onChangeSubtaskCheckbox(index, id) {
		const newList = [...this.state.subtasks];
		newList[index].done = !newList[index].done;
		this.setState({ subtasks: newList });
		this.tickUntickItem(id, newList[index].done)
	}
	handleSubtaskInput(event) {
		this.setState({inputSubtask: event.target.value});
	}
	starHandler(index, item) {
		let val = false;
		if (!item.starred) {
			// this.props.starHandler(this.props.item.id, true);
			val = true;
		}
		if (this.props.authorised) {
			app.database().ref('users/' + this.props.authorised + '/subtasks/' + item.id + '/starred').set(val);
		} else {
			indexedDB.table('subtasks')
				.update(item.id, { starred: val })
				.then(() => {
					const newList = this.state.subtasks.map((item) => Object.assign({}, item));
					newList[index].starred = val;
					this.setState({ subtasks: newList });
				})
				.catch(() => {
					notification.open({
						message: 'Error',
						description: 'Something went wrong. Please refresh the browser.',
					});
				});
		}
	}
	render() {
		if (this.props.authorised !== null) {
			const subtasks = this.state.subtasks.map((item, index) => {
				let starIcon = (<button title="Star item" className="button-no-decoration single-task-subtasks__star-icon" onClick={() => {this.starHandler(index, item)}}><Icon type="star-o" /></button>);
				if (item.starred) {
					starIcon = (<button title="Remove star from item" onClick={() => {this.starHandler(index, item)}} className="button-no-decoration single-task-subtasks__star-icon single-task-subtasks__star-icon--active"><Icon type="star" /></button>);
				}
				let clicked = false;
				return (
					<li onClick={() => {clicked ? clicked = false : clicked = true}} key={item.id} className={"single-task-subtasks__item " + (clicked ? 'single-task-subtasks__item--active' : '')}>
						<Checkbox onChange={() => this.onChangeSubtaskCheckbox(index, item.id)} checked={item.done} />
						<span className="single-task-subtasks__text">{item.text}</span>
						{starIcon}
						<button onClick={() => this.deleteSubtask(item.id)} className="button-no-decoration single-task-subtasks__delete-subtask"><Icon type="close" /></button>
					</li>
				);
			});
			return (
				<div>
					<form onSubmit={this.addSubtask} className="single-task-subtasks__input-wrap">
						<Input className="single-task-subtasks__input" placeholder={'Sub-task...'} value={this.state.inputSubtask} onChange={this.handleSubtaskInput} addonAfter={<button className="single-task-subtasks__add-button" type="submit">ADD</button>} />
					</form>
					<ul className="single-task-subtasks__list">
						{subtasks}
					</ul>
				</div>
			);
		}
		return (<div></div>);
	}
}

export default SingleTaskSubtasks;