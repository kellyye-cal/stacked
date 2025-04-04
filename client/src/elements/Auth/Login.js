import React, {useState} from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowTurnDown, faCheck } from '@fortawesome/free-solid-svg-icons'; // Import the specific icon
import Logo from "../Logo";

function Login() {
    const [phone, setPhone] = useState();
    const [validPhone, setValidPhone] = useState(false);

    const parsePhone = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove all non-digit characters

        if (value.length === 10) {
            setValidPhone(true);
        } else {
            setValidPhone(false);
        }

        if (value.length > 3 && value.length <= 6) {
            value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}`;
        } else if (value.length > 6) {
            value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
        } else if (value.length > 3) {
            value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
        } else if (value.length <= 3 && value.length > 0){
            value = `(${value.slice(0, 3)})`;
        }

        e.target.value = value;
        setPhone(value);
    }

    return (
        <div className="auth-page">
            <Logo/>
            <form className="login-form" style={{margin: "40px auto"}}>
                <h1> Login </h1>

                <div style={{margin: "12px 0", textAlign: "center"}}>
                    <p className="body-large"> Enter your phone number </p>
                    <p className="small-label subtle"> We'll send a verification code to this number.</p>
                </div>

                <div style={{display: "flex", alignItems: "center", margin: "12px auto", height: 40}}>
                    <div style={{
                        backgroundColor: "#454A53",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "0px 12px",
                        fontWeight: 600,
                        borderRadius: "4px 0px 0px 4px",
                        height: "100%",
                        alignSelf: "stretch"}}>
                        +1 
                    </div>

                    <div style={{position: "relative", flex: "1", height: "100%"}}>
                        <input
                            style={{borderRadius: "0px 4px 4px 0px"}}
                            type="tel"
                            id="phone"
                            onChange={parsePhone}
                            value={phone}
                            required
                            placeholder={"(xxx)-xxx-xxxx"}
                        />

                        {validPhone ?
                            <FontAwesomeIcon
                                icon={faCheck} 
                                style={{position: "absolute",
                                        right: "12px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: "#4A90E2"
                                }}/>
                            : <></>
                        }
                    </div>
                </div>

                <button className="coral square"> 
                     <div > Login </div>
                    <FontAwesomeIcon icon={faArrowTurnDown} rotation={90} size="xs" style={{marginLeft: 8, marginTop: 0}}/>
                </button>
            </form>
        </div>
    )
}

export default Login;