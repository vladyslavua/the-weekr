import React, { Component } from 'react';
import './styles.css';

import { Icon } from 'antd';

class BottomSlider extends Component {
	constructor(props) {
		super(props);
		this.state = {
			bottomSlider: false,
			slowHideBottom: false,
			callbackFunc: null
		};
		this.landingBottomHandler = this.landingBottomHandler.bind(this);
	}
	landingBottomHandler(callback) {
		if (this.state.bottomSlider) {
			this.setState({slowHideBottom: true});
			setTimeout(() => {
				this.setState({bottomSlider: false});
				this.props.onCloseBottomSlider();
			}, 500);
		} else {
			this.setState({slowHideBottom: false});
			this.setState({bottomSlider: true});
			callback();
		}
	}
	render() {
		return this.state.bottomSlider ? (
			<section className={"bottom-slider__wrap " + (this.state.slowHideBottom?'slow-hide-active':'')}>
				<button onClick={this.landingBottomHandler} className="button-no-decoration bottom-slider__close-button"><Icon type="close" /></button>
				{this.props.children}
			</section>
		) :
		('');
	}
}

export default BottomSlider;