import React, {useState, useEffect, useContext} from "react";
import apiClient from "../../api/api";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthProvider";

const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ'-]+$/;
const DISPLAY_REGEX = /^[a-zA-Z0-9]+$/;
// const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

function RegisterForm({setNextSteps, phoneNumber}) {
    const navigate = useNavigate();
    const {auth, setAuth} = useContext(AuthContext);

    const [displayName, setDisplayName] = useState("");
    const [fName, setFname] = useState("");
    const [lName, setLName] = useState("");
    // const [pwd, setPwd] = useState("");
    // const [confirmPwd, setConfirmPwd] = useState("");
    // const [validPwd, setValidPwd] = useState(false);
    // const [validMatch, setValidMatch] = useState(false);

    const [formPage, setFormPage] = useState(1);

    const submitPageOne = async(e) => {
        e.preventDefault();
        setFormPage(2);
    }

    const submitPageTwo = async(e) => {
        e.preventDefault();
        if (displayName.length === 0) {
            setDisplayName(fName);
        }

        await apiClient.post(
            '/api/auth/register',
            {displayName: displayName || fName, fName, lName, phoneNumber}
        ).then((res) => {
            if (res.status === 200) {
                const {accessToken, userID, fName, lName, displayName, phone, refreshToken} = res.data;

                sessionStorage.setItem('accessToken', accessToken);
                sessionStorage.setItem('userID', userID);
                sessionStorage.setItem('name', fName + ' ' + lName);

                setAuth({accessToken, userID, loggedOut: false, displayName});
                setTimeout(() => {
                    navigate(`/home`);
                }, 1000);
            }
        }).catch((err) => {
            console.error(err);
        })
    }

    // useEffect(() => {
    //     setValidPwd(PWD_REGEX.test(pwd));
    //     setValidMatch(pwd === confirmPwd);
    // }, [pwd, confirmPwd]);

    return (
        formPage === 1 ?
            (<form className="login-form" style={{margin: "40px auto"}} onSubmit={submitPageOne}>
                <h1> Create Account </h1>
                <p> All fields required. </p>

                <div className="fields">
                    <div className="field-pairs">
                        <label
                            for="fname">
                            First Name
                        </label>
                        <input
                            type="text"
                            id="fname"
                            onChange={(e) => {setFname(e.target.value)}}
                            value={fName}
                            required
                            placeholder={"Jane"}
                        />
                    </div>

                    <div className="field-pairs">
                        <label for="lname"> Last Name </label>
                        <input
                            type="text"
                            id="lname"
                            onChange={(e) => {setLName(e.target.value)}}
                            value={lName}
                            required
                            placeholder={"Doe"}
                        />
                    </div>

                    {/* <div className="field-pairs">
                        <label for="pwd"> Password </label>
                        <input
                            type="password"
                            id="pwd"
                            onChange={(e) => {setPwd(e.target.value)}}
                            value={pwd}
                            required
                            placeholder={"Enter password"}
                            className={`${(pwd && !validPwd) ? "invalid-input" : ""}`}
                        />
                        {(pwd && !validPwd) ? <p className="small-label red-text"> <span style={{fontWeight: 600}}>*Enter a valid password.</span><br/> 
                        Must include uppercase and lowercase letters, a number, and a special character (!@#$%) </p> : <></>}
                    </div>

                    <div className="field-pairs">
                        <label for="confirm"> Confirm Password </label>
                        <input
                            type="password"
                            id="confirm"
                            onChange={(e) => setConfirmPwd(e.target.value)}
                            value={confirmPwd}
                            required
                            placeholder={"Confirm password"}
                            className={`${(confirmPwd && !validMatch) ? "invalid-input" : ""}`}
                        />
                        {(confirmPwd && !validMatch) ? <p style={{marginTop: 2}} className="small-label red-text"> Please make sure your passwords match. </p> : <></>}
                    </div> */}
                </div>
            
                <button className="coral square" onClick={() => {setFormPage(2)}}> 
                    Next
                </button>
            </form>)
        :
        (<form className="login-form" style={{margin: "40px auto"}} onSubmit={submitPageTwo}>
            <h1> Create Account </h1>
            
            <div className="fields">
                <div className="field-pairs">
                    <label for="displayName"> Display Name </label>
                    <input
                        type="text"
                        id="displayName"
                        onChange={(e) => {setDisplayName(e.target.value)}}
                        value={displayName}
                        placeholder={fName || "Start typing..."}
                    />
                </div>
            </div>

            <div className="h-between" style={{width: "calc(100% - 100px)"}}>
                <button type="button"
                        style={{padding: 0, backgroundColor: "transparent", color: "var(--warm-coral)"}}
                        onClick={() => {setFormPage(1)}}>
                    Back
                </button>

                <button type="submit"
                        className="coral square">
                    Next
                </button>
            </div>
        </form>)
    )
}

export default RegisterForm;