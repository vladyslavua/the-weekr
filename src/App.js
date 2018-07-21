import React, { Component } from 'react';
import './App.css';
import 'antd/dist/antd.css';

import { Layout } from 'antd';
import indexedDB from './indexedDB';

import Header from './components/Header/index';
import AllTasks from './components/AllTasks/index';
import WeekTable from './components/WeekTable/index';

const { Content } = Layout;

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { todos: [] };
        this.addItem = this.addItem.bind(this);
        this.updateItem = this.updateItem.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
    };

    addItem(item) {
        const todo = {
            text: item,
            done: false,
        };
        indexedDB.table('todos')
            .add(todo)
            .then((id) => {
                const newList = [...this.state.todos, Object.assign({}, todo, { id })];
                this.setState({ todos: newList });
                console.log(id);
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
            });
    }
    deleteItem(id) {
        indexedDB.table('todos')
            .delete(id)
            .then(() => {
                const newList = this.state.todos.filter((todo) => todo.id !== id);
                this.setState({ todos: newList });
            });
    }
    componentDidMount() {
        indexedDB.table('todos')
            .toArray()
            .then((todos) => {
                this.setState({ todos }, () => {
                    // console.log(this.state.todos);
                });
            });
    }
    render() {
        return (
            <Layout>
                <Header />
                <Content className="content-wrap content-wrap--flex-container">
                    <AllTasks addItem={this.addItem} updateItem={this.updateItem} deleteItem={this.deleteItem} todoList={this.state.todos} />
                    <WeekTable todoList={this.state.todos} />
                </Content>
            </Layout>
        );
    }
}

export default App;
