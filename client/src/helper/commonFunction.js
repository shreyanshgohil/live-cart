import React from 'react';
import {BridgeApp, config_variable} from './commonApi';
import {Button as AppButton, Redirect} from '@shopify/app-bridge/actions';

const convertToBoolean = (binary_value) => {
    if (binary_value === 0 || binary_value === '0') {
        return false;
    } else {
        return true;
    }
};

const convertToBinary = (boolean) => {
    if (boolean === true) {
        return 1;
    } else {
        return 0;
    }
};

function checkStrExistInArray(str, array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].includes(str)) {
            return true;
        } else {
            return false;
        }
    }
}

function getJsDate(date, format = 'DD-MM-YYYY') {
    const splitDate = date.split('-');
    switch (format) {
        case 'DD-MM-YYYY':
            return new Date(splitDate[2], Number(splitDate[1]) - 1, splitDate[0]);
        case 'MM-DD-YYYY':
            return new Date(splitDate[2], Number(splitDate[0]) - 1, splitDate[1]);
        case 'YYYY-MM-DD':
            return new Date(splitDate[0], Number(splitDate[1]) - 1, splitDate[2]);
        default:
            break;
    }
    return new Date();
}
function changeDateSeparator(date = '', existing_separator, replace_separator) {
    return date.replaceAll(existing_separator, replace_separator);
}

function getTime(date) {
    return new Date(date).getTime();
}

function getJsTime(jsDate) {
    return (jsDate).getTime();
}

function handlePageRefresh(event) {
    const e = event || window.event;
    // Cancel the event
    e.preventDefault();
    if (e) {
        e.returnValue = ''; // Legacy method for cross browser support
    }
    return ''; // Legacy method for cross browser support
}

const handleTitleBar = (lable, url) => {
    if (process.env?.MODE !== 'local') {
        let earnPointsBreadcrumb = AppButton.create(BridgeApp, { label: lable });
        earnPointsBreadcrumb.subscribe(AppButton.Action.CLICK, () => {
            BridgeApp.dispatch(Redirect.toApp({ path: url }));
        });

        return earnPointsBreadcrumb;
    } else {
        return {};
    }
}

// Function to set a cookie
function setCookie(name, value, expirationHours) {
    var expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + (expirationHours * 60 * 60 * 1000));
    var expires = "expires=" + (expirationHours ? expirationDate.toUTCString() : 0);
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

// Function to get the value of a cookie by name
function getCookie(name) {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if (cookie.indexOf(name + "=") == 0) {
            return cookie.substring(name.length + 1, cookie.length);
        }
    }
    return null;
}

export { convertToBoolean, convertToBinary, checkStrExistInArray, setCookie, getCookie, getJsDate, getTime, getJsTime, handlePageRefresh, changeDateSeparator, handleTitleBar };
