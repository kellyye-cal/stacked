import React, {useState} from "react";
import apiClient from "../../api/api";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowTurnDown, faCheck } from '@fortawesome/free-solid-svg-icons'; // Import the specific icon

function PhoneForm({setNextSteps, setPhoneDisplay}) {
    const [phone, setPhone] = useState("");
    const [validPhone, setValidPhone] = useState(false);
    const [validPhoneDisplay, setValidPhoneDisplay] = useState("");


    const parsePhone = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove all non-digit characters

        if (value.length === 10) {
            setValidPhone(true);
            setValidPhoneDisplay("");
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
        setPhoneDisplay(value);
    }

    const verifyPhone = async(e) => {
        e.preventDefault();

        let phoneNumber = phone.replace(/\D/g, '');

        if (validPhone) {
            await apiClient.post(
                "/api/auth/login", 
                {phoneNumber}, {
                    headers: {'Content-Type': 'application/json'},
                    withCredentials: true
                }).then((res) => {
                    setNextSteps(res.data.next);
                }).catch((err) => {
                    console.error(err);
                })
        } else {
            setValidPhoneDisplay("Please enter a valid phone number")
        }
    }
    return (
        <form className="login-form" style={{margin: "40px auto"}} onSubmit={verifyPhone}>
            <h1> Login </h1>

            <div style={{margin: "12px 0", textAlign: "center"}}>
                <p className="body-large"> Enter your phone number </p>
                <p className="small-label subtle"> We'll send a verification code to this number.</p>
            </div>

            <div style={{display: "flex", alignItems: "center", margin: "12px auto 4px auto", height: 40}}>
                <div style={{
                    backgroundColor: "#454A53",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "0px 12px",
                    fontWeight: 600,
                    borderRadius: "4px 0px 0px 4px",
                    height: "100%",
                    alignSelf: "stretch",
                    }}>
                    +1 
                </div>

                <div style={{position: "relative", flex: "1", height: "100%"}}>
                    <input
                        style={{borderRadius: "0px 4px 4px 0px", border: `${validPhoneDisplay.length === 0 ? "" : "1px var(--red-text) solid"}`}}
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
            <p className="small-label red-text" style={{marginBottom: 12}}> {validPhoneDisplay} </p>

            <button className="coral square"> 
                <div > Login </div>
                <FontAwesomeIcon icon={faArrowTurnDown} rotation={90} size="xs" style={{marginLeft: 8, marginTop: 0}}/>
            </button>
        </form>
    )
}

export default PhoneForm;