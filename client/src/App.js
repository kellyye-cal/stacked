import './App.css';
import React, {useContext, useEffect} from 'react'
import { AuthProvider } from './context/AuthProvider';

import {BrowserRouter} from 'react-router-dom';
import apiClient, {useAxiosInterceptors} from './api/api';

import AppRoutes from './AppRoutes'
import AuthContext from './context/AuthProvider';

function App() {
  useAxiosInterceptors();

  const {auth, setAuth} = useContext(AuthContext);


  useEffect(() => {
    const storedAccessToken = sessionStorage.getItem('accessToken');
    const storedUserId = sessionStorage.getItem('userID');
    const storedName = sessionStorage.getItem('name');
    const storedDisplayName = sessionStorage.getItem('displayName');
    const storedProfilePic = sessionStorage.getItem('profilePic');

    if (storedAccessToken && storedUserId) {
        setAuth({
            accessToken: storedAccessToken,
            userID: storedUserId,
            loggedOut: false,
            name: storedName,
            displayName: storedDisplayName,
            profilePic: storedProfilePic,
        });
    } else if (auth?.loggedOut || !auth?.accessToken) {
      return
    } else if (!auth?.loggedOut && auth.accessToken) {
      return
    }
  }, [setAuth]);

  useEffect(() => {
    const refreshAccessToken = async () => {
      if (auth?.loggedOut || !auth?.accessToken) {
        return;
      }
    
      try {
        const response = await apiClient.post('/api/auth/refresh', {}, {
          withCredentials: true,
        });

        const newAccessToken = response.data.accessToken;

        if (newAccessToken !== auth.accessToken) {
          setAuth((prev) => ({ ...prev, accessToken: newAccessToken, loggedOut: false}));

          sessionStorage.setItem('accessToken', newAccessToken);
        }
      } catch (err) {
        console.error("Error refreshing access token:", err);
      }
    }

    if (auth?.accessToken) {
      refreshAccessToken();
    }

  }, [auth?.loggedOut, setAuth]);

  return (
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
  );
}

export default App;
