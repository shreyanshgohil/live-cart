import config from '../config/config.js';
import {handleError, handleSuccess} from '../helper/response_handler.js';
import nodemailer from 'nodemailer';

const addContactFormFn = async (req, res) => {
    const {status_code_config: statusCode, en_message_config: en} = config;
    try {
        const reqData = req.body;
        const storeData = res?.locals;

        console.log(storeData, 'storeData')

        handleSuccess(statusCode.OK, en.DATA_SAVED_SUCCESSFULLY, '', res);
    } catch (error) {
        console.log('error========generate_token===========>', error);
        handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
    }


}

export {addContactFormFn};


