import React, { Component } from 'react';
import './App.css';
import 'antd/dist/antd.css';

import { Layout, notification } from 'antd';
import indexedDB from './indexedDB';

import Header from './components/Header/index';
import AllTasks from './components/AllTasks/index';
import WeekTable from './components/WeekTable/index';
import StatsBottom from './components/StatsBottom/index';

const { Content } = Layout;

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { todos: [], archived: [], statsBottom: false, landingBottom: false, weekItems: [], slowHideBottom: false };
        this.addItem = this.addItem.bind(this);
        this.updateItem = this.updateItem.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
        this.editItem = this.editItem.bind(this);
        this.archiveItem = this.archiveItem.bind(this);
        this.unarchiveItem = this.unarchiveItem.bind(this);
        this.hoverTodo = this.hoverTodo.bind(this);
        this.statsBottomHandler = this.statsBottomHandler.bind(this);
        this.todoStarHandler = this.todoStarHandler.bind(this);
    };
    hoverTodo(id) {
        this.foo.todoHover(id);
    }
    addItem(item) {
        const todo = {
            text: item,
            done: false,
            archived: 0,
            updatedOn: + new Date(),
            starred: false
        };
        indexedDB.table('todos')
            .add(todo)
            .then((id) => {
                const newList = [...this.state.todos, Object.assign({}, todo, { id })];
                this.setState({ todos: newList });
            })
            .catch(() => {
                notification.open({
                    message: 'Error',
                    description: 'Something went wrong. Please refresh the browser.',
                });
            });
    }
    updateItem(id, done) {
        indexedDB.table('todos')
            .update(id, { done })
            .then(() => {
                const index = this.state.todos.map((e) => e.id).indexOf(id);
                const newList = this.state.todos.map((item) => Object.assign({}, item));
                newList[index].done = done;
                this.setState({ todos: newList });
            })
            .catch(() => {
                notification.open({
                    message: 'Error',
                    description: 'Something went wrong. Please refresh the browser.',
                });
            });
    }
    editItem(id, text) {
        indexedDB.table('todos')
            .update(id, { text })
            .then(() => {
                const index = this.state.todos.map((e) => e.id).indexOf(id);
                const newList = this.state.todos.map((item) => Object.assign({}, item));
                newList[index].text = text;
                this.setState({ todos: newList });
            })
            .catch(() => {
                notification.open({
                    message: 'Error',
                    description: 'Something went wrong. Please refresh the browser.',
                });
            });
    }
    deleteItem(id) {
        indexedDB.table('todos')
            .delete(id)
            .then(() => {
                const newList = this.state.archived.filter((todo) => todo.id !== id);
                this.setState({ archived: newList });
                this.deleteDayItem(id);
                this.deleteSubtasks(id);
            })
            .catch((err) => {
                notification.open({
                    message: 'Error',
                    description: 'Something went wrong. Please refresh the browser.',
                });
            });
    }
    deleteDayItem(id) {
        indexedDB.table('days')
            .where('taskId').equals(id)
            .delete()
            .then(() => {
            });
    }
    deleteSubtasks(id) {
        indexedDB.table('subtasks')
            .where('taskId').equals(id)
            .delete()
            .then(() => {
            });
    }
    archiveItem(id) {
        indexedDB.table('todos')
            .update(id, { archived: 1, updatedOn: + new Date() })
            .then(() => {
                const index = this.state.todos.map((e) => e.id).indexOf(id);
                const newList = this.state.todos.map((item) => Object.assign({}, item));
                const newListArchived = this.state.archived.map((item) => Object.assign({}, item));
                newListArchived.push(newList[index]);
                newList.splice(index, 1);
                this.setState({ todos: newList });
                this.setState({ archived: newListArchived });

            })
            .catch(() => {
                notification.open({
                    message: 'Error',
                    description: 'Something went wrong. Please refresh the browser.',
                });
            });
    }
    unarchiveItem(id) {
        indexedDB.table('todos')
            .update(id, { archived: 0, updatedOn: + new Date() })
            .then(() => {
                const index = this.state.archived.map((e) => e.id).indexOf(id);
                const newList = this.state.todos.map((item) => Object.assign({}, item));
                const newListArchived = this.state.archived.map((item) => Object.assign({}, item));
                newList.push(newListArchived[index]);
                newListArchived.splice(index, 1);
                this.setState({ todos: newList });
                this.setState({ archived: newListArchived });
            })
            .catch(() => {
                notification.open({
                    message: 'Error',
                    description: 'Something went wrong. Please refresh the browser.',
                });
            });
    }
    todoStarHandler(id, val) {
        indexedDB.table('todos')
            .update(id, { starred: val })
            .then(() => {
                const index = this.state.todos.map((e) => e.id).indexOf(id);
                const newList = this.state.todos.map((item) => Object.assign({}, item));
                newList[index].starred = val;
                this.setState({ todos: newList });
            })
            .catch(() => {
                notification.open({
                    message: 'Error',
                    description: 'Something went wrong. Please refresh the browser.',
                });
            });
    }
    componentDidMount() {
        notification.config({
            placement: 'bottomLeft',
        });
        indexedDB.table('todos')
            .where('archived').equals(0)
            .sortBy('updatedOn')
            .then((todos) => {
                this.setState({ todos });
            })
            .catch(() => {
                notification.open({
                    message: 'Error',
                    description: 'Something went wrong. Please refresh the browser.',
                });
            });
        indexedDB.table('todos')
            .where('archived').equals(1)
            .sortBy('updatedOn')
            .then((archived) => {
                this.setState({ archived });
            })
            .catch(() => {
                notification.open({
                    message: 'Error',
                    description: 'Something went wrong. Please refresh the browser.',
                });
            });
    }
    statsBottomHandler() {
        if (this.state.statsBottom) {
            this.setState({slowHideBottom: true});
            setTimeout(() => {
                this.setState({statsBottom: false});
            }, 500);
            // this.setState({statsBottom: false});
        } else {
            this.setState({slowHideBottom: false});
            this.setState({statsBottom: true});
        }
    }
    render() {
        return (
            <Layout>
                <Header />
                <Content className="content-wrap content-wrap--flex-container">
                    <AllTasks todoStarHandler={this.todoStarHandler} hoverTodo={this.hoverTodo} addItem={this.addItem} updateItem={this.updateItem} deleteItem={this.deleteItem} todoList={this.state.todos} archivedList={this.state.archived} editItem={this.editItem} archiveItem={this.archiveItem} unarchive={this.unarchiveItem} />
                    <WeekTable ref={foo => this.foo = foo} todoList={this.state.todos} statsBottomHandler={this.statsBottomHandler} />
                </Content>
                {this.state.statsBottom ? (<StatsBottom slowHide={this.state.slowHideBottom} statsBottomHandler={this.statsBottomHandler} />) : ''}
            </Layout>
        );
    }
}

export default App;
