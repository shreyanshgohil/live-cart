import React, { useMemo, lazy, Suspense } from 'react';
import { NavigationMenu, Provider, RoutePropagator } from '@shopify/app-bridge-react';
import { AppProvider, Frame, Spinner } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { config_variable } from '../helper/commonApi';
import { useDispatch, useSelector } from 'react-redux';
import { generateToken } from '../redux/slice/commonSlice';
import LocalMenu from '../pages/LocalMenu';
import HomePage from '../pages/HomePage';
import NotFound from '../pages/NotFound';



export function Router() {
    const {status} = useSelector(
        (store) => store.commonData
    );
    const location = useLocation();
    const dispatch = useDispatch();

    useMemo(async () => {
        await dispatch(generateToken()).unwrap();
    }, []);

    if (!config_variable.config.host) {
        config_variable.config.host = location?.state?.config?.host ? location?.state?.config?.host : config_variable.config.host;
        config_variable.shop_name = location?.state?.shop_name ? location?.state?.shop_name : config_variable.shop_name;
    }

    return (
        <>
            <div>
                <AppProvider i18n={enTranslations}>
                    {process.env?.MODE && process.env?.MODE !== 'local' ?
                        !status ? <div style={{textAlign: "center", paddingTop: "20%"}}>
                                <Spinner accessibilityLabel="Spinner example" size="large"/>
                            </div> :
                            <Provider config={config_variable.config}>
                                <NavigationMenu
                                    navigationLinks={[
                                        {
                                            label: 'Test',
                                            destination: '/Test'
                                        },
                                        /*{
                                            label: 'FAQ',
                                            destination: '/faq'
                                        },*/
                                    ]}
                                    matcher={(link, location) =>  link.destination === location.pathname}/>
                                <Frame>
                                    <RoutePropagator location={location}/>
                                    <Outlet/>
                                </Frame>
                            </Provider> : <>
                            <LocalMenu/><Outlet/>
                        </>
                    }
                </AppProvider>
            </div>
        </>
    );
}

export const routes = [
    { path: '/', component: <HomePage /> },
    { path: '/home', component: <HomePage /> },
    { path: '*', component: <NotFound /> },
];
