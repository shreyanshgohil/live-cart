import React, {Component} from 'react';
import {ApiCall} from './axios';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            hasError: true,
            error,
            errorInfo
        });

        const errMsg = error.message;
        const pageName = errorInfo.componentStack.toString();
        const fields_data = { page_name: `${errMsg}`, data: `${pageName}` };
        const Errorhandal = async () => {
            const token = this.props.token;
            await ApiCall('POST', 'node/admin_api/rct_common_err',
                { fields_data, tbl_name: 'err_rct'},
                { authentication: `${token}`, 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
            );
        };
        Errorhandal();
    }

    render() {
        if (this.state.errorInfo) { return <></>; }
        return this.props.children;
    }
}

export default ErrorBoundary;

