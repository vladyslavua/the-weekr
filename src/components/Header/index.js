import React, { Component } from 'react';
import './styles.css';

import { Icon } from 'antd';

class Header extends Component {
    render() {
        return (
            <footer className="footer-wrap">
                <span className="footer__copyright">&copy;</span> The Weekr
                <span className="footer-right">
                    <button className="footer-ext-icon button-no-decoration"><Icon type="github" /></button>
                    <button className="footer-ext-icon button-no-decoration"><Icon type="medium" /></button>
                    <button className="footer-ext-icon button-no-decoration"><Icon type="twitter" /></button>
                    <span className="footer__divider">|</span>
                    <button onClick={this.props.landingBottomHandler} className="footer__about button-no-decoration">About <Icon className="footer__icon-up" type="up" /></button>
                </span>
            </footer>
        );
    }
}

export default Header;