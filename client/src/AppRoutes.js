import React, {useContext, useEffect} from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import apiClient, {useAxiosInterceptors} from './api/api';
import AuthContext from './context/AuthProvider';
import Login from "./elements/Auth/Login"
import Home from './elements/Home/Home'
import Logout from './elements/Auth/Logout';

function AppRoutes() {
    useAxiosInterceptors();

    const {auth, setAuth} = useContext(AuthContext);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        sessionStorage.setItem("lastVisitedPage", location.pathname);
    }, [location.pathname]);

    useEffect(() => {
        const lastVisitedPage = sessionStorage.getItem("lastVisitedPage");
    
        if (auth?.accessToken && lastVisitedPage) {
            navigate(lastVisitedPage, { replace: true });
        }

      }, [auth?.accessToken, navigate]);

    // useEffect(() => {
    //     const refreshAccessToken = async () => {
    //         if (auth?.loggedOut || !auth?.accessToken) {
    //             return;
    //         }

    //         try {
    //             const response = await apiClient.post('/api/auth/refresh', {}, {
    //                 withCredentials: true, // Send cookies with the request
    //             });

    //             const newAccessToken = response.data.accessToken;

    //             if (newAccessToken !== auth.accessToken) {
    //                 setAuth((prev) => ({ ...prev, accessToken: newAccessToken, loggedOut: false, admin: response.data.admin }));
    //                 sessionStorage.setItem('accessToken', newAccessToken);
    //             }
    //         } catch (err) {
    //             console.error("Error refreshing access token:", err);
    //         }
    //     }

    //     if (auth?.accessToken) {
    //         refreshAccessToken();
    //     }

    // }, [location.pathname]);

    const ProtectedRoute = ({children}) => {
        const location = useLocation();

        if (!auth?.accessToken) {
            return <Navigate to="/" replace />
        }
        return children;
    };
    return (
        <Routes>
            <Route exact path="/" element={auth.accessToken === null ? <Navigate to="/login" /> : <Navigate to={`/home`} />} />

            <Route path="/home"
                   element={auth.accessToken ? (
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                   ) : (
                    <Navigate to="/login" />
                   )
                   }
            />

            <Route path="/login" element={auth.accessToken ? <Navigate to={`/home`} /> : <Login />} />
            <Route path="/logout" element={<Logout />} />
        </Routes>
    )
}

export default AppRoutes;