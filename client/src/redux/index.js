import {configureStore} from '@reduxjs/toolkit';
import commonSlice from './slice/commonSlice';

const Store = configureStore({
    reducer: {
        commonData: commonSlice
    }
});

export default Store;
