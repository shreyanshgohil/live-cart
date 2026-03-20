import mongoose from "mongoose";
import config from "../config/config.js";

export const mongodb = async () => {
    try {
        mongoose.connect(`${config.MONGODB_URL}${config.MONGODB_NAME}`)
            .then(async () => {
                console.log("============= Mongoose Connected ===============");
            });
    } catch (error) {
        console.log("error=====>>>>>>>", error)
    }
};
