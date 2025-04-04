import React, {useContext, useEffect} from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Login from "./elements/Auth/Login"

function AppRoutes() {
    return (
        <Routes>
            <Route exact path="/" element={<Login />}/>
        </Routes>
    )
}

export default AppRoutes;