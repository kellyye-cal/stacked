import React, {useState, useEffect, useContext} from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthProvider";


import Logo from "../Logo";
import PhoneForm from "./PhoneForm";
import VerifyPhone from "./VerifyPhone";
import RegisterForm from "./RegisterForm";

function Login() {
    const navigate = useNavigate();
    const [phoneDisplay, setPhoneDisplay] = useState("");
    const [nextSteps, setNextSteps] = useState("Start");
    const [userInfo, setUserInfo] = useState({});
    const {auth, setAuth} = useContext(AuthContext);

    useEffect(() => {
        if (userInfo.user) {
            const {accessToken, userID, fName, lName, displayName} = userInfo.user;

            sessionStorage.setItem('accessToken', accessToken);
            sessionStorage.setItem('userID', userID);
            sessionStorage.setItem('name', fName + ' ' + lName);

            setAuth({accessToken, userID, loggedOut: false, displayName});
        }
    }, [userInfo, setAuth])

    useEffect(() => {
        if (auth?.accessToken && !auth.loggedOut) {
            console.log(auth)
            navigate(`/home`);
        }
    }, [auth, navigate])

    return (
        <div className="auth-page">
            <Logo/>

            {nextSteps === "Verify" ?
                <VerifyPhone setNextSteps={setNextSteps} phoneNumber={phoneDisplay} setUserInfo={setUserInfo}/>
            : nextSteps === "Register" ?
                <RegisterForm setNextSteps={setNextSteps} phoneNumber={phoneDisplay.replace(/\D/g, '')}/>
            :
                <PhoneForm setNextSteps={setNextSteps} setPhoneDisplay={setPhoneDisplay}/>
            }
            
        </div>
    )
}

export default Login;