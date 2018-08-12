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
			<header className="landing-bottom__wrap">
				<h1>The Weekr</h1>
				<h4>Plan your week ahead. Make yourself more productive.</h4>
				<ul>
					<li>Focus on global repetitive tasks. Create sub-tasks.</li>
					<li>Assign tasks for any day of the week.</li>
					<li>Track the progress. Improve results.</li>
					<li>All stored locally. Registration is only for device sync.</li>
				</ul>
				<div className="landing-bottom__pics">
					<img className="landing-bottom__pics__one" src="./pic1.png" alt="List Example"/>
					<img className="landing-bottom__pics__two" src="./pic3.png" alt="Performance Graph Example" />
				</div>
			</header>
		);
	}
}

export default LandingBottom;