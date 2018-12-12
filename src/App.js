import React, { Component } from 'react';
import './App.css';
import 'antd/dist/antd.css';
import '../node_modules/firebaseui/dist/firebaseui.css';

import { Layout, notification, Drawer, Button, Modal, message, Input } from 'antd';
import indexedDB from './indexedDB';

import Header from './components/Header/index';
import AllTasks from './components/AllTasks/index';
import WeekTable from './components/WeekTable/index';
import StatsBottom from './components/StatsBottom/index';
import LandingBottom from './components/LandingBottom/index';
import BottomSlider from './components/BottomSlider/index';

import 'firebaseui';
import app from 'firebase/app';
import 'firebase/database';

const { Content } = Layout;
const confirm = Modal.confirm;

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { todos: [], archived: [], statsBottom: false, landingBottom: false, weekItems: [], slowHideBottom: false, showHideSettings: false, showModal: false, emailState: '', authorised: null, authorisedName: null, dataTransferModal: false, signinMethod: null };
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
        this.userSignIn = this.userSignIn.bind(this);
        this.checkSignInState = this.checkSignInState.bind(this);
        this.userSignOut = this.userSignOut.bind(this);
        this.transferSubtasksTableToCloud = this.transferSubtasksTableToCloud.bind(this);
        this.handleDataTransferModalCancel = this.handleDataTransferModalCancel.bind(this);
        this.handleDataTransferModalOpen = this.handleDataTransferModalOpen.bind(this);
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
        if (this.state.authorised) {
             app.database().ref('users/' + this.state.authorised + '/todos').push().set({
                text: item,
                done: false,
                archived: 0,
                updatedOn: + new Date(),
                starred: false
            });
        } else {
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
    }
    updateItem(id, done) {
        if (this.state.authorised) {
            app.database().ref('users/' + this.state.authorised + '/todos/' + id + '/done').set(done);
        } else {
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
    }
    editItem(id, text) {
        if (this.state.authorised) {
            app.database().ref('users/' + this.state.authorised + '/todos/' + id + '/text').set(text);
        } else {
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
    }
    deleteItem(id) {
        if (this.state.authorised) {
            app.database().ref('users/' + this.state.authorised + '/todos/' + id).remove();
            this.deleteDayItem(id);
            this.deleteSubtasks(id);
        } else {
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
    }
    deleteDayItem(id) {
        if (this.state.authorised) {
            app.database().ref('users/' + this.state.authorised + '/days').orderByChild('taskId').equalTo(id + '').once('value').then(function(snapshot) {
                let resData = snapshot.val();
                if (resData) {
                    let newRes = Object.keys(resData).reduce((acc, key) => {acc[key] = null; return acc; }, {});
                    app.database().ref('users/' + this.state.authorised + '/days').update(newRes);
                }
            }.bind(this));
        } else {
            indexedDB.table('days')
                .where('taskId').equals(id)
                .delete()
                .then(() => {
                });
        }
    }
    deleteSubtasks(id) {
        if (this.state.authorised) {
            app.database().ref('users/' + this.state.authorised + '/subtasks').orderByChild('taskId').equalTo(id + '').once('value').then(function(snapshot) {
                let resData = snapshot.val();
                if (resData) {
                    let newRes = Object.keys(resData).reduce((acc, key) => {acc[key] = null; return acc; }, {});
                    app.database().ref('users/' + this.state.authorised + '/subtasks').update(newRes);
                }
            }.bind(this));
        } else {
            indexedDB.table('subtasks')
                .where('taskId').equals(id)
                .delete()
                .then(() => {
                });
        }
    }
    archiveItem(id) {
        if (this.state.authorised) {
            app.database().ref('users/' + this.state.authorised + '/todos/' + id + '/archived').set(1);
            app.database().ref('users/' + this.state.authorised + '/todos/' + id + '/updatedOn').set(+ new Date());
        } else {
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
    }
    unarchiveItem(id) {
        if (this.state.authorised) {
            app.database().ref('users/' + this.state.authorised + '/todos/' + id + '/archived').set(0);
            app.database().ref('users/' + this.state.authorised + '/todos/' + id + '/updatedOn').set(+ new Date());
        } else {
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
    }
    todoStarHandler(id, val) {
        if (this.state.authorised) {
            app.database().ref('users/' + this.state.authorised + '/todos/' + id + '/starred').set(val);
        } else {
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
    }
    componentDidMount() {
        notification.config({
            placement: 'bottomLeft',
        });
        this.initFirebase();
    }
    initFirebase() {
        var config = {
            apiKey: "AIzaSyD3W9HcrBSh71ZBupGG1w0JTTMrmMQJNB4",
            authDomain: "the-weekr.firebaseapp.com",
            databaseURL: "https://the-weekr.firebaseio.com",
            projectId: "the-weekr",
            storageBucket: "the-weekr.appspot.com",
            messagingSenderId: "342767133705"
        };
        app.initializeApp(config);
        this.checkSignInState();
    }
    userSignIn(transferData) {
        let provider;
        if (this.state.signinMethod === 'facebook') {
            provider = new app.auth.FacebookAuthProvider();
        } else if (this.state.signinMethod === 'google') {
            provider = new app.auth.GoogleAuthProvider();
        } else {
            message.error('Error!');
            return ;
        }
        app.auth().signInWithPopup(provider).then(function(result) {
            // This gives you a Facebook Access Token. You can use it to access the Facebook API.
            // var token = result.credential.accessToken;
            // The signed-in user info.
            // var user = result.user;
            // ...
            this.setState({authorised: result.user.uid}, () => {
                if (transferData) {
                    Promise.all([
                        this.transferSubtasksTableToCloud(),
                        this.transferTodosToCloud(),
                        this.transferDaysTableToCloud(),
                    ]).then(() => {
                        this.eraseDb().then((data) => {
                            message.success('You have been authenticated. Your data is saved in cloud.');
                            this.handleDataTransferModalCancel();
                            window.location.reload();
                        });
                    });
                } else {
                    this.handleDataTransferModalCancel();
                    this.settingsDrawerHandler();
                    message.success('You have been authenticated.');
                    window.location.reload();
                }
            });
        }.bind(this)).catch(function(error) {
            console.log(error);
            notification.open({
                message: 'Error',
                description: 'Something went wrong. Please refresh the browser.',
            });
            // Handle Errors here.
            // var errorCode = error.code;
            // var errorMessage = error.message;
            // The email of the user's account used.
            // var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            // var credential = error.credential;
            // ...
        });
    }
    userSignOut() {
        app.auth().signOut().then(function() {
            // Sign-out successful.
            window.location.reload();
        }).catch(function(error) {
            // An error happened.
            console.log(error);
            notification.open({
                message: 'Error',
                description: 'Something went wrong. Please refresh the browser.',
            });
        });
    }
    checkSignInState() {
        app.auth().onAuthStateChanged(function(user) {
            if (user) {
                this.setState({authorised: user.uid, authorisedName: user.displayName}, () => {
                    this.getTodosCloud();
                });
            } else {
                this.setState({authorised: false});
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
        }.bind(this));
    }
    getTodosCloud() {
        //get todos
        let todos = app.database().ref('users/' + this.state.authorised + '/todos').orderByChild('archived').equalTo(0);
        todos.on('value', function(snapshot) {
            let data = snapshot.val();
            if (!data) {
                this.setState({ todos: [] });
                return;
            }
            let todosList = Object.entries(data).map(([key, value]) => {
                let res = value;
                if (res.id === undefined) {
                    res.id = key;
                }
                return res;
            });
            this.setState({ todos: todosList });
        }.bind(this));
        //get archived
        let archived = app.database().ref('users/' + this.state.authorised + '/todos').orderByChild('archived').equalTo(1);
        archived.on('value', function(snapshot) {
            let data = snapshot.val();
            let archivedList = [];
            if (data) {
                archivedList = Object.entries(data).map(([key, value]) => {
                    let res = value;
                    res.id = key;
                    return res;
                });
            }
            this.setState({ archived: archivedList });
        }.bind(this));
    }
    transferTodosToCloud() {
        // let json = this.state.todos.reduce((json, value, key) => { json[value.id] = value; return json; }, {});
        // let jsonArchived = this.state.archived.reduce((json, value, key) => { json[value.id] = value; return json; }, {});
        // let merged = {...json, ...jsonArchived};
        // app.database().ref('users/' + this.state.authorised + '/todos').set(merged);
        return new Promise((resolve, reject) => {
            indexedDB.table('todos')
                .toArray()
                .then((items) => {
                    let json = items.reduce((json, value, key) => { json[value.id] = value; return json; }, {});
                    app.database().ref('users/' + this.state.authorised + '/todos').set(json).then(() => {
                        resolve(true);
                    });
                })
                .catch(() => {
                    notification.open({
                        message: 'Error',
                        description: 'Something went wrong. Data transfer was unsuccessful.',
                    });
                });
        });
    }
    transferDaysTableToCloud() {
        return new Promise((resolve, reject) => {
            indexedDB.table('days')
                .toArray()
                .then((items) => {
                    let json = items.reduce((json, value, key) => {
                        value.taskId = value.taskId + '';
                        json[value.id] = value;
                        return json;
                    }, {});
                    app.database().ref('users/' + this.state.authorised + '/days').set(json).then(() => {
                        resolve(true);
                    });
                })
                .catch(() => {
                    notification.open({
                        message: 'Error',
                        description: 'Something went wrong. Data transfer was unsuccessful.',
                    });
                });
        });
    }
    transferSubtasksTableToCloud() {
        return new Promise((resolve, reject) => {
            indexedDB.table('subtasks')
                .toArray()
                .then((subtasks) => {
                    let json = subtasks.reduce((json, value, key) => {
                        value.taskId = value.taskId + '';
                        json[value.id] = value;
                        return json;
                    }, {});
                    app.database().ref('users/' + this.state.authorised + '/subtasks').set(json).then(() => {
                        resolve(true);
                    });
                })
                .catch(() => {
                    notification.open({
                        message: 'Error',
                        description: 'Something went wrong. Data transfer was unsuccessful.',
                    });
                });
        });
    }
    addInitData() {
        this.addItem('Click on graph button on the top to compare your week-to-week performance. Use week table to assign tasks from the list for each day of the week.');
        this.addItem('Click to expand the card for editing an item, archiving or adding sub-tasks to it.');
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
            this.setState({showHideSettings: true}, () => {
                // var uiConfig = {
                //     // signInSuccessUrl: '<url-to-redirect-to-on-success>',
                //     signInOptions: [
                //         // Leave the lines as is for the providers you want to offer your users.
                //         app.auth.FacebookAuthProvider.PROVIDER_ID,
                //     ],
                //     // tosUrl and privacyPolicyUrl accept either url string or a callback
                //     // function.
                //     // Terms of service url/callback.
                //     // tosUrl: '<your-tos-url>',
                //     // Privacy policy url/callback.
                //     // privacyPolicyUrl: function() {
                //     //     window.location.assign('https://google.com');
                //     // }
                // };

                // Initialize the FirebaseUI Widget using Firebase.
                // var ui = new firebaseui.auth.AuthUI(app.auth());
                // The start method will wait until the DOM is loaded.
                // console.log(document.querySelector('#firebaseui-auth-container'));
                // ui.start('#firebaseui-auth-container', uiConfig);
            });
        }
    }
    eraseDb() {
        return new Promise((resolve, reject) => {
            indexedDB.delete().then(() => {
                message.success('Local database has been successfully erased.');
                resolve(true);
                // window.location.reload();
            }).catch((err) => {
                message.error('Something went wrong. Local database cannot be erased.');
                resolve(true);
            }).finally(() => {
            });
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
                that.eraseDb().then((data) => {
                    window.location.reload();
                });
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
    handleDataTransferModalCancel() {
        this.setState({ dataTransferModal: false });
    }
    handleDataTransferModalOpen(method) {
        this.setState({ signinMethod: method, dataTransferModal: true });
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
        if (this.state.authorised !== null) {
            return (
                <Layout>
                    <Header featureModal={this.handleModalOpen} landingBottomHandler={this.landingBottomHandler} />
                    <Content className="content-wrap content-wrap--flex-container">
                        <AllTasks authorisedName={this.state.authorisedName} authorised={this.state.authorised} todoStarHandler={this.todoStarHandler} hoverTodo={this.hoverTodo} addItem={this.addItem} updateItem={this.updateItem} deleteItem={this.deleteItem} todoList={this.state.todos} archivedList={this.state.archived} editItem={this.editItem} archiveItem={this.archiveItem} unarchive={this.unarchiveItem} settingsDrawerHandler={this.settingsDrawerHandler} />
                        <WeekTable ref={foo => this.foo = foo} todoList={this.state.todos} statsBottomHandler={this.statsBottomHandler} authorised={this.state.authorised} />
                    </Content>
                    <BottomSlider ref={this.bottomSlider} onCloseBottomSlider={this.onCloseBottomSlider}>
                        {this.state.landingBottom ? (<LandingBottom />) : ''}
                        {this.state.statsBottom ? (<StatsBottom authorised={this.state.authorised} />) : ''}
                    </BottomSlider>
                    <Drawer
                        title="More"
                        placement="left"
                        closable={false}
                        onClose={this.settingsDrawerHandler}
                        visible={this.state.showHideSettings}
                    >
                        <section className="drawer-settings__wrap">
                            <Button className={"drawer-settings__login-brn drawer-settings__login-brn--logout " + (this.state.authorised ? '' : 'hidden')} type="primary" onClick={this.userSignOut}>Log Out</Button>
                            {/*<Button className="drawer-settings__login-brn drawer-settings__login-brn--signup" type="primary" onClick={this.handleModalOpen}>Sign Up</Button>*/}
                            {/*<Button className="drawer-settings__login-brn drawer-settings__login-brn--signin" type="default" onClick={this.handleModalOpen}>Sign In</Button>*/}
                            <div className={(this.state.authorised ? 'hidden' : '')} id="firebaseui-auth-container" lang="en"><div className="firebaseui-container firebaseui-page-provider-sign-in firebaseui-id-page-provider-sign-in firebaseui-use-spinner"><div className="firebaseui-card-content"><ul className="firebaseui-idp-list"><li className="firebaseui-list-item"><button onClick={() => {this.handleDataTransferModalOpen('facebook')}} className="firebaseui-idp-button mdl-button mdl-js-button mdl-button--raised firebaseui-idp-facebook firebaseui-id-idp-button" data-provider-id="facebook.com" data-upgraded=",MaterialButton"><span className="firebaseui-idp-icon-wrapper"><img className="firebaseui-idp-icon" alt="" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/facebook.svg" /></span><span className="firebaseui-idp-text firebaseui-idp-text-long">Sign in with Facebook</span><span className="firebaseui-idp-text firebaseui-idp-text-short">Facebook</span></button></li></ul></div><div className="firebaseui-card-footer firebaseui-provider-sign-in-footer"></div></div></div>
                            <div className={(this.state.authorised ? 'hidden' : '')} id="firebaseui-auth-container" lang="en"><div className="firebaseui-container firebaseui-page-provider-sign-in firebaseui-id-page-provider-sign-in firebaseui-use-spinner"><div className="firebaseui-card-content"><ul className="firebaseui-idp-list"><li className="firebaseui-list-item"><button onClick={() => {this.handleDataTransferModalOpen('google')}} className="firebaseui-idp-button mdl-button mdl-js-button mdl-button--raised firebaseui-idp-google firebaseui-id-idp-button" data-provider-id="google.com" data-upgraded=",MaterialButton"><span className="firebaseui-idp-icon-wrapper"><img className="firebaseui-idp-icon" alt="" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" /></span><span className="firebaseui-idp-text firebaseui-idp-text-long">Sign in with Google</span><span className="firebaseui-idp-text firebaseui-idp-text-short">Google</span></button></li></ul></div><div className="firebaseui-card-footer firebaseui-provider-sign-in-footer"></div></div></div>
                            <span className="drawer-settings__registration-text"><p>Authentication allows cross-platform data synchronisation.</p><p>By selecting authentication method, you will be asked if you want to transfer your current local data to the cloud.</p></span>
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
                    <Modal
                        visible={this.state.dataTransferModal}
                        title="Transferring data to cloud"
                        onOk={this.handleDataTransferModalOpen}
                        onCancel={this.handleDataTransferModalCancel}
                        footer={[
                            <Button key="transfer" onClick={() => {this.userSignIn(true)}}>Transfer</Button>,
                            <Button key="dontTransfer" onClick={() => {this.userSignIn(false)}}>Don't Transfer</Button>,
                        ]}
                    >
                        <p>Would you like to transfer all your local data to the cloud?</p><p className="transfer-modal__extratext">* Transferring data from your local storage will overwrite your cloud data and erase local. "Don't transfer" option will load previously saved in the cloud data.</p>
                    </Modal>
                </Layout>
            );
        }
        return (<div></div>);
    }
}

export default App;
