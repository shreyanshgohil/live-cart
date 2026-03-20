import React from 'react';
import {Button} from '@shopify/polaris';
import {useNavigate} from "react-router-dom";

const LocalMenu = () => {
    const navigate = useNavigate();
    return (
        <div className="header-menu-admin">
            <Button size="large" onClick={() => {
                navigate('/')
            }}>Home</Button>
        </div>
    );
};

export default LocalMenu;
