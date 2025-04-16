import React, {useRef, useContext, useState} from 'react';
import Logo from './Logo';
import { Link, NavLink } from 'react-router-dom';
import Dropdown from './Dropdown';
import AuthContext from '../context/AuthProvider';
import ProfilePicture from './ProfilePicture';

function NavBar({userID}) {
    const {auth, setAuth} = useContext(AuthContext);
    const [open, setOpen] = useState(false);
    const buttonRef = useRef();

    const close = () => setOpen(false);
    const toggleMenu = () => setOpen(prev => !prev);

    return (
        <div className="h-between">
            <Logo size={"m"}/>

            <div style={{display: "flex", alignItems: "center", gap: 20}}>
                <NavLink className="nav-link" to='/home'> Home </NavLink>
                
                <div >
                    <button ref={buttonRef} onClick={toggleMenu}>
                        <ProfilePicture size={"med"} url={auth.profilePic} />
                    </button>

                    <Dropdown isOpen={open} closeFunc={close} buttonRef={buttonRef}>
                        <p className="subtle"> {auth.userID} </p>

                        <div className='dropdown-settings'>
                            <Link to="/settings"> Settings </Link>
                            <Link to="/logout"> Logout </Link>
                        </div>
                    </Dropdown>
                </div>

            </div>
        </div>
    )
}

export default NavBar;