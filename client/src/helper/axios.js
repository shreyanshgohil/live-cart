import axios from 'axios';
import { admin_apiEndpoint, client_apiEndpoint } from './commonApi';
/* import {handlePageRefresh} from './commonFunction'; */
const { config_variable } = require('./commonApi');

const service = axios.create({
    headers: {}
});
const handleSuccess = (response) => {
    return response;
};

const handleError = (error) => {
    return Promise.reject(error);
};
service.interceptors.response.use(handleSuccess, handleError);

export const ApiCall = async (method, path, payload, header, type) => {
    try {
        const responce = await service.request({
            method,
            url: (type ? client_apiEndpoint : admin_apiEndpoint) + path,
            responseType: 'json',
            data: payload,
            headers: header
        });
        return responce;
    } catch (error) {
        // window.parent.location.href = `${responce.url}node/admin_api/?shop=${config_variable.shop_name}&host=${config_variable?.config?.host}`;
        console.error('axiosApiCall-----==', error);
        if (error.message === 'Network Error') {
            console.error(`${error}, Server is not responding, please try again after some time`);
        }
        if (error.response?.data?.statusCode === 401 && header && !header['access-token']) {
            if (error.response.data.refresh_expire) {
                return error.response;
            }
        } else {
            return error.response;
        }
    }
};

export const GetApiCall = async (method, path, header) => {
    try {
        const responce = await service.request({
            method,
            url: admin_apiEndpoint + path,
            responseType: 'json',
            headers: header
        });
        return responce;
    } catch (error) {
        console.error('axios---getapicall--==', error);
        if (error.message === 'Network Error') {
            console.error(`${error}, Server is not responding, please try again after some time`);
        }
        if (error.response?.data?.statusCode === 401) {
            return error.response;

        } else {
            return error.response;
        }
    }
};
