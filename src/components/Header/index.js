import React, { Component } from 'react';
import './styles.css';

import { Icon } from 'antd';

class Header extends Component {
    render() {
        return (
            <footer className="footer-wrap">
                <span className="footer__copyright">&copy;</span> The Weekr
                <span className="footer-right">
                    {/*<a target="_blank" href="https://github.com/vladyslavua/the-weekr" rel="noopener noreferrer" className="footer-ext-icon button-no-decoration"><Icon type="github" /></a>*/}
                    <a target="_blank" href="https://medium.com/the-weekr" rel="noopener noreferrer" className="footer-ext-icon button-no-decoration"><Icon type="medium" /></a>
                    <a target="_blank" href="https://twitter.com/theweekr" rel="noopener noreferrer" className="footer-ext-icon button-no-decoration"><Icon type="twitter" /></a>
                    <a target="_blank" href="https://instagram.com/theweekr" rel="noopener noreferrer" className="footer-ext-icon button-no-decoration"><Icon type="instagram" /></a>
                    <span className="footer__divider footer__divider--no-mar-l">|</span>
                    <a onClick={this.props.featureModal} className="footer-ext-icon button-no-decoration"><Icon className="footer-ext-icon--apple" type="apple" /></a>
                    <a onClick={this.props.featureModal} className="footer-ext-icon button-no-decoration"><Icon className="footer-ext-icon--android" type="android" /></a>
                    <span className="footer__divider">|</span>
                    <button onClick={this.props.landingBottomHandler} className="footer__about button-no-decoration">About <Icon className="footer__icon-up" type="up" /></button>
                </span>
            </footer>
        );
    }
}

export default Header;