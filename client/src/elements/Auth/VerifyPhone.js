import React, {useState, useEffect} from "react";
import apiClient from "../../api/api";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowTurnDown, faCheck } from '@fortawesome/free-solid-svg-icons';

function VerifyPhone({setNextSteps, phoneNumber, setUserInfo}) {
    const [verifyCode, setVerifyCode] = useState(null);
    const [incorrectDisplay, setIncorrectDisplay] = useState("");
    const [canResend, setCanResend] = useState(true)
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(60);

    let phone = phoneNumber.replace(/\D/g, '');

    const handleVerify = async (e) => {
        e.preventDefault();

        await apiClient.post(
            '/api/auth/verify',
             {code: verifyCode, phone}
        ).then((res) => {
            if (res.data.next === "Register") {
                setNextSteps(res.data.next);
                setIncorrectDisplay("");
            } else if (res.data.next === "LoginExisting") {
                setNextSteps(res.data.next);
                setUserInfo(res.data.user);
                setIncorrectDisplay("")
            } else if (res.data.next === "InvalidCode") {
                setIncorrectDisplay("Incorrect code, please double check.")
            } 
        }).catch((err) => {
            console.error(err)
        })
    }

    useEffect(() => {
        if (!resending || cooldown === 0) {return};

        const interval = setInterval(() => {
            setCooldown(prev => {
                if (prev === 1) {
                    setCanResend(true);
                    clearInterval(interval);
                    return 0
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [resending, cooldown]);

    const resendCode = async(e) => {
        setCooldown(60);
        e.preventDefault();

        setResending(true);
        setIncorrectDisplay("");
        setVerifyCode(null);
        setCanResend(false);

        await apiClient.post(
            '/api/auth/login',
            {phoneNumber: phone}
        ).then((res) => {
            
        }).catch((err) => {console.error(err)})
    }

    return (
        <form className="login-form" style={{margin: "40px auto"}} onSubmit={handleVerify}>
            <h1> Login </h1>

            <div style={{margin: "12px 0", textAlign: "center"}}>
                <p className="body-large"> Enter the code sent to <b> +1{phoneNumber} </b> </p>
            </div>

            
            <input
                style={{margin: "12px auto 4px auto", border:`${incorrectDisplay.length === 0 ? "" : "var(--red-text)"} 1px solid`}}
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                id="verify"
                onChange={(e) => {setVerifyCode(e.target.value)}}
                value={verifyCode}
                required
                placeholder={"xxxx"}
            />

            <p className="small-label red-text" style={{marginBottom: 12}}> {incorrectDisplay} </p>

            {canResend ? 
                <p className="small-label"> Didn't receive a code? <button className="coral-text" onClick={resendCode} type="button"> Resend it </button></p>
            :
                <p className="small-label"> Code resent. Didn't receive it? Try again in {cooldown}s. </p>
            }
        
            <button type="submit" className="coral square" style={{marginTop: 12}}> 
                <div onClick={handleVerify}> Verify </div>
                <FontAwesomeIcon icon={faArrowTurnDown} rotation={90} size="xs" style={{marginLeft: 8, marginTop: 0}}/>
            </button>
        </form>
    )
};

export default VerifyPhone;