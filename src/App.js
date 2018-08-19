import React, { Component } from 'react';
import './App.css';
import 'antd/dist/antd.css';

import { Layout, notification, Drawer, Button, Modal, message, Input } from 'antd';
import indexedDB from './indexedDB';

import Header from './components/Header/index';
import AllTasks from './components/AllTasks/index';
import WeekTable from './components/WeekTable/index';
import StatsBottom from './components/StatsBottom/index';
import LandingBottom from './components/LandingBottom/index';
import BottomSlider from './components/BottomSlider/index';

const { Content } = Layout;
const confirm = Modal.confirm;

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { todos: [], archived: [], statsBottom: false, landingBottom: false, weekItems: [], slowHideBottom: false, showHideSettings: false, showModal: false, emailState: '' };
        this.bottomSlider = React.createRef();
        this.addItem = this.addItem.bind(this);
        this.updateItem = this.updateItem.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
        this.editItem = this.editItem.bind(this);
        this.archiveItem = this.archiveItem.bind(this);
        this.unarchiveItem = this.unarchiveItem.bind(this);
        this.hoverTodo = this.hoverTodo.bind(this);
        this.statsBottomHandler = this.statsBottomHandler.bind(this);
        this.todoStarHandler = this.todoStarHandler.bind(this);
        this.settingsDrawerHandler = this.settingsDrawerHandler.bind(this);
        this.eraseDb = this.eraseDb.bind(this);
        this.landingBottomHandler = this.landingBottomHandler.bind(this);
        this.onCloseBottomSlider = this.onCloseBottomSlider.bind(this);
        this.showDeleteConfirm = this.showDeleteConfirm.bind(this);
        this.handleModalOpen = this.handleModalOpen.bind(this);
        this.handleModalCancel = this.handleModalCancel.bind(this);
        this.submitEmail = this.submitEmail.bind(this);
        this.handleEmailChange = this.handleEmailChange.bind(this);
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
                if (index >= 0) {
                    const newList = this.state.todos.map((item) => Object.assign({}, item));
                    newList[index].done = done;
                    this.setState({ todos: newList });
                } else {
                    const index = this.state.archived.map((e) => e.id).indexOf(id);
                    if (index >= 0) {
                        const newList = this.state.archived.map((item) => Object.assign({}, item));
                        newList[index].done = done;
                        this.setState({archived: newList});
                    }
                }

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
        indexedDB.table('user')
            .toArray()
            .then((user) => {
                if (user.length === 0) {
                    this.landingBottomHandler();
                    indexedDB.table('user')
                        .add({seenLanding: true})
                        .then(() => {
                            this.addInitData();
                        })
                } else {

                }
            })
            .catch(() => {
                this.landingBottomHandler();
            });
    }
    addInitData() {
        this.addItem('Please use recent browsers to keep data constantly saved. Do not use incognito mode. All data stored locally.');
        this.addItem('Keep global repetitive tasks in this list.');
        this.addItem('Click on item to add more specific sub-tasks.');
        this.addItem('Click on graph button on the top to compare your week-to-week performance.');
        this.addItem('Use week table to assign tasks from the list for each day of the week.');
    }
    statsBottomHandler() {
        this.bottomSlider.current.landingBottomHandler(() => {
            if (this.state.statsBottom) {
                this.onCloseBottomSlider()
            } else {
                this.setState({statsBottom: true});
            }
        });
    }
    landingBottomHandler() {
        this.bottomSlider.current.landingBottomHandler(() => {
            if (this.state.landingBottom) {
                this.onCloseBottomSlider()
            } else {
                this.setState({landingBottom: true});
            }
        });
    }
    onCloseBottomSlider() {
        this.setState({landingBottom: false});
        this.setState({statsBottom: false});
    }
    settingsDrawerHandler() {
        if (this.state.showHideSettings) {
            this.setState({showHideSettings: false});
        } else {
            this.setState({showHideSettings: true});
        }
    }
    eraseDb() {
        indexedDB.delete().then(() => {
            message.success('Database has been successfully erased.');
            window.location.reload();
        }).catch((err) => {
            message.error('Something went wrong. Database cannot be erased.');
        }).finally(() => {
        });
    }
    showDeleteConfirm() {
        const that = this;
        confirm({
            title: 'Are you sure erase your data?',
            content: 'All your data will be lost.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                that.eraseDb();
            },
            onCancel() {
            },
        });
    }
    handleModalCancel() {
        this.setState({ showModal: false });
    }
    handleModalOpen() {
        this.setState({ showModal: true });
    }
    submitEmail(event) {
        event.preventDefault();
        fetch('/email', {
            method: 'post',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
                "email": this.state.emailState
            })
        })
            .then((response) => {
                if (response.status === 200) {
                    message.success('Your email has been successfully submitted. Nice one.');
                } else {
                    message.error('Something went wrong. Email was not submitted. Please contact support if it appears again.');
                }
                this.handleModalCancel();
            });
    }
    handleEmailChange(event) {
        this.setState({emailState: event.target.value});
    }
    render() {
        return (
            <Layout>
                <Header featureModal={this.handleModalOpen} landingBottomHandler={this.landingBottomHandler} />
                <Content className="content-wrap content-wrap--flex-container">
                    <AllTasks todoStarHandler={this.todoStarHandler} hoverTodo={this.hoverTodo} addItem={this.addItem} updateItem={this.updateItem} deleteItem={this.deleteItem} todoList={this.state.todos} archivedList={this.state.archived} editItem={this.editItem} archiveItem={this.archiveItem} unarchive={this.unarchiveItem} settingsDrawerHandler={this.settingsDrawerHandler} />
                    <WeekTable ref={foo => this.foo = foo} todoList={this.state.todos} statsBottomHandler={this.statsBottomHandler} />
                </Content>
                <BottomSlider ref={this.bottomSlider} onCloseBottomSlider={this.onCloseBottomSlider}>
                    {this.state.landingBottom ? (<LandingBottom />) : ''}
                    {this.state.statsBottom ? (<StatsBottom />) : ''}
                </BottomSlider>
                <Drawer
                    title="Settings"
                    placement="left"
                    closable={false}
                    onClose={this.settingsDrawerHandler}
                    visible={this.state.showHideSettings}
                >
                    <section className="drawer-settings__wrap">
                        <Button className="drawer-settings__login-brn drawer-settings__login-brn--signup" type="primary" onClick={this.handleModalOpen}>Sign Up</Button>
                        <Button className="drawer-settings__login-brn drawer-settings__login-brn--signin" type="default" onClick={this.handleModalOpen}>Sign In</Button>
                        <span className="drawer-settings__registration-text">* Registration allows cross-platform data synchronisation</span>
                        <Button className="drawer-settings__erase-brn" onClick={this.showDeleteConfirm} type="dashed">Erase Local Database</Button>
                    </section>
                </Drawer>
                <Modal
                    visible={this.state.showModal}
                    title="Feature is under development"
                    onOk={this.handleModalCancel}
                    onCancel={this.handleModalCancel}
                    footer={[
                        <Button key="back" onClick={this.handleModalCancel}>Return</Button>,
                    ]}
                >
                    This feature is under development. Please leave your email for latest updates.
                    <form className="modal-feature__form" onSubmit={this.submitEmail}>
                        <Input value={ this.state.emailState } onChange={ this.handleEmailChange } className="modal-feature__email" placeholder="Your email" addonAfter={<button type="submit">Submit</button>} />
                    </form>
                </Modal>
            </Layout>
        );
    }
}

export default App;
