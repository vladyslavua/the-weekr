import React, { Component } from 'react';
import './styles.css';

class LandingBottom extends Component {
	constructor(props) {
		super(props);
		this.state = {data: []};
		// this.getItemForSpecificDay = this.getItemForSpecificDay.bind(this);
	}
	componentDidMount() {
	}

	render() {
		return (
			<div className="landing-bottom__wrap">
				<h1>The Weekr</h1>
				<h4>Track your progress and plan week ahead</h4>
				<ul>
					<li>Existing calendars are event-based rather than task-based</li>
					<li>Keeping all your tasks in one list allows to know your work load at any moment and be flexible</li>
					<li>Global repetitive tasks are the key. Plan week with them. Be more specific in subtasks</li>
				</ul>
				<div className="landing-bottom__pics">
					<img className="landing-bottom__pics__one" src="./pic1.png" alt="List Example"/>
					<img className="landing-bottom__pics__two" src="./pic3.png" alt="Performance Graph Example" />
				</div>
			</div>
		);
	}
}

export default LandingBottom;