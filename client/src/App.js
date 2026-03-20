import React from 'react';
import {Router, routes} from './router/Router';
import {Frame} from '@shopify/polaris';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import '@shopify/polaris/build/esm/styles.css';
import './assets/css/style.css';


function App() {

    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<Router />} >
                        {routes.map((route, i) => (<Route exact={true} path={route.path} key={i} element={
                            <Frame>
                                {route.component}
                            </Frame>} />))}
                        <Route element={<Navigate to='/' replace />} />
                    </Route>
                </Routes>
            </BrowserRouter >
        </>
    );
}

export default App;
