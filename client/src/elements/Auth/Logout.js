import React, {useContext, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from "../../context/AuthProvider"
import apiClient from '../../api/api';

function Logout() {
    const navigate = useNavigate();
    const {auth, setAuth} = useContext(AuthContext);

    useEffect(() => {
        const handleLogout = async() => {

            try {
                console.log("Access Token: ", auth?.accessToken);

                if (auth.accessToken) {
                    apiClient.post(
                        '/api/auth/logout',
                        { id: auth.userId },
                        {headers: {Authorization: `Bearer ${auth?.accessToken}`}, withCredentials: true}
                    )
                    
                    sessionStorage.removeItem('accessToken');
                    sessionStorage.removeItem('userID');
                    sessionStorage.removeItem('name');
                    sessionStorage.removeItem('displayName');
            
                    setAuth({accessToken: null, userID: null, loggedOut: true, displayName: null, name: null})
                    
                }

                navigate('/login');

        
            } catch (err) {
                console.error("Error logging out: ", err)
            }
        }

        handleLogout();

    }, [auth, setAuth, navigate]);

    return (
        <div></div>
    );
};

export default Logout;