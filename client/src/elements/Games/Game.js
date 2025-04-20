import React, {useContext, useEffect, useState} from "react";
import { useParams, useNavigate } from "react-router-dom";

import apiClient from "../../api/api";
import NavBar from "../NavBar";
import Modal from '../Modal';
import Chip from '../Chip';
import AuthContext from "../../context/AuthProvider";
import {formatGameTimeExpanded, formatCurrency} from "../../utils"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faTimes } from "@fortawesome/free-solid-svg-icons";
import ProfilePicture from "../ProfilePicture";
import GameSettings from "./GameSettings";
import ChipAmounts from './ChipAmounts';

const DOLLAR_REGEX = /^\d*\.?\d{0,2}$/;

function Game() {
    const {auth} = useContext(AuthContext);
    const navigate = useNavigate();

    const {groupID, gameID} = useParams();
    const [buyIn, setBuyIn] = useState("");
    const [chips, setChips] = useState(new Map());
    const [netInvestment, setNetInvestments] = useState({});
    const [netEarnings, setNetEarnings] = useState({});
    const [name, setName] = useState("");
    const [time, setTime] = useState("");
    const [activityLog, setActivityLog] = useState([]);
    const [initialLog, setInitialLog] = useState([]);
    const [players, setPlayers] = useState({});
    const [status, setStatus] = useState("")

    const [buyInModalOpen, SetBuyInModal] = useState(false);
    const [buyInPlayer, setBuyInPlayer] = useState("");
    const [buyInID, setBuyInID] = useState("");

    const [gameSettingsOpen, setGameSettingsOpen] = useState(false);

    const [editAmountOpen, setEditAmountOpen] = useState(false);
    const [newBuyIn, setNewBuyIn] = useState("");
    const [newChips, setNewChips] = useState(new Map());
    const [validAmounts, setValidAmounts] = useState(true);

    const fetchGameData = () => {
        apiClient.post(`/api/games/get_game`,
            {groupID, gameID},
            {headers: {Authorization: `Bearer ${auth?.accessToken}`}, withCredentials: true}
        ).then((res) => {
            const {buyinPrice, chipValues, earnings, sessionName, timestamp, investment} = res.data.game;
            setBuyIn(buyinPrice);
            setNewBuyIn(buyinPrice);
            setChips(new Map(Object.entries(chipValues)));
            setNewChips(new Map(Object.entries(chipValues)));
            setNetEarnings(earnings);
            setNetInvestments(investment);
            setName(sessionName);
            setTime(formatGameTimeExpanded(timestamp));
            setStatus(res.data.game.status);

            setActivityLog(res.data.activityLog);
            setInitialLog(res.data.activityLog[0]);

            setPlayers(res.data.players)

        }).catch((err) => console.error(err))
    }

    useEffect(() => {
        fetchGameData();
    }, [gameID, groupID, auth?.accessToken])

    const playerBuyIn = (userID, displayName) => {
        SetBuyInModal(true);
        setBuyInPlayer(displayName);
        setBuyInID(userID);
    }

    const cancelBuyIn = () => {
        SetBuyInModal(false);
        setBuyInPlayer("");
        setBuyInID("")
    }

    const confirmBuyIn = () => {
        apiClient.post('/api/games/buyin',
            {groupID, gameID, userID: buyInID},
            {headers: {Authorization: `Bearer ${auth?.accessToken}`}, withCredentials: true}
        ).then((res) => {
            if (res.status === 204) {
                cancelBuyIn();
                fetchGameData();
            }
        }).catch((err) => console.error(err))
    }

    const resetAmounts = () => {
        setNewChips(chips);
        setNewBuyIn(buyIn);
    }

    const saveAmounts = () => {
        let newChipsObj = Object.fromEntries(newChips);
        let newBuyInAmount = newBuyIn || buyIn;
        apiClient.post('/api/games/set_amounts',
            {groupID, gameID, newChips: newChipsObj, newBuyInAmount, userID: auth.userID},
            {headers: {Authorization: `Bearer ${auth?.accessToken}`}, withCredentials: true}
        ).then((res) => {
            if (res.status === 204) {
                resetAmounts();
                fetchGameData();
                setEditAmountOpen(false);
            }
        }).catch((err) => console.error(err))
    }

    return (
        <div className="page">
            <NavBar />

            <div className="content">
                <Modal isOpen={buyInModalOpen} closeFunc={() => {SetBuyInModal(false)}}>
                    <h3> Confirm ${buyIn} buy in for {buyInPlayer}? </h3>
                    <div className="h-between" style={{marginTop: 20}}>
                        <button onClick={cancelBuyIn}>
                            Cancel
                        </button>

                        <button className="square vibrant-blue-bg" onClick={confirmBuyIn}>
                            Confirm
                        </button>
                    </div>
                </Modal>

                <GameSettings 
                    isOpen={gameSettingsOpen}
                    setOpen={setGameSettingsOpen}
                    gameID={gameID}
                    groupID={groupID}
                    players={players}
                    name={name}
                    fetchGameData={fetchGameData} />
                <div className="h-between">
                    <div>
                        <h1> {name} </h1>
                        <h6 className="subtle"> Started {time} by </h6>
                    </div>

                    <div className="subtle" style={{display: "flex", alignItems: "center", gap: 8}}>
                        <h6> #{gameID} </h6>
                        <button className="subtle" onClick={() => setGameSettingsOpen(true)}>
                            <FontAwesomeIcon icon={faGear} />   
                        </button>
                    </div>
                </div>

                <div className="section">
                    <h2> Players </h2>
                    <div className="group-card-members large">
                        {Object.entries(players).map(([userID, info]) => (
                            <div key={userID}>
                                <ProfilePicture size="large" url={info.profilePic} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="section">
                    <div className="h-between">
                        <div style={{display: "flex", alignItems: "center", gap: 20}}>
                            <h2 style={{margin: 0}}> Amounts </h2>
                            <h6 style={{margin: 0}}> <span className="vibrant-blue"> ${buyIn} </span> Buy In </h6>
                        </div>

                        <button 
                            className="subtle"
                            onClick={() => setEditAmountOpen(true)}>
                            <h6> Edit </h6>
                        </button>

                        <Modal isOpen={editAmountOpen} closeFunc={() => {setEditAmountOpen(false); resetAmounts();}}>
                            <div className="h-between" style={{marginBottom: 12}}>
                                <h3> Set Game Amounts </h3>
                                <button onClick={() => setEditAmountOpen(false)}>
                                    <FontAwesomeIcon icon={faTimes}/>
                                </button>
        
                            </div>

                            <div className="flex-column" style={{marginBottom: 12}}>
                                    <label for="buyin" style={{marginBottom: 4}}> Set Buy In Amount </label>
                                    <div style={{position: "relative"}}>
                                        <input
                                            type="text"
                                            id="buyin"
                                            onChange={(e) => {
                                                setNewBuyIn(e.target.value);
                                            }}
                                            value={newBuyIn}
                                            placeholder={buyIn}
                                            style={{paddingLeft: 40, boxSizing: "border-box", width: "100%"}}
                                        />
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: "50%",
                                                left: 0,
                                                transform: "translateY(-50%)",
                                                backgroundColor: "var(--subtle-gray)",
                                                height: "100%",
                                                padding: "0px 10px",
                                                display: "flex",
                                                alignItems: "center",
                                                borderRadius: "4px 0px 0px 4px"
                                            }}> 
                                            $
                                        </div>
        
                                    </div>
    
                                    {DOLLAR_REGEX.test(newBuyIn) ? <></> : <p className="small-label red-text">Please enter a valid dollar amount. </p>}
                                </div>
                            <ChipAmounts
                                chips={newChips}
                                setChips={setNewChips}
                                validAmounts={validAmounts}
                                setValidAmounts={setValidAmounts}/>

                            <div className="h-between" style={{marginTop: 12}}>
                                <button onClick={resetAmounts} className="subtle">
                                    Reset
                                </button>

                                <button onClick={saveAmounts} className="square vibrant-blue-bg">
                                    Save
                                </button>
                            </div>
                        </Modal>
                    </div>


                    <div style={{display: "flex", gap: 20, marginTop: 8}}>
                        {[...chips.entries()]
                            .sort(([, aAmount], [, bAmount]) => aAmount - bAmount)
                            .map(([color, amount]) => (
                            <div className="flex-column" style={{alignItems: "center", gap: 4}}>
                                <Chip color={color}/>
                                <p> {formatCurrency(amount)} </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="section">
                    <h2> Earnings </h2>
                    <div>
                        <table className="earnings-table">
                            <thead>
                                <tr>
                                    <th className="rank-col"> Rank </th>
                                    <th className="player-col"> Player </th>
                                    {status === 'End' ? 
                                        <th className="winnings-col"> 
                                            Net Winnings
                                        </th> 
                                        : 
                                        <></>
                                    }
                                    <th className="invest-col"> Investment </th>
                                    {status === 'Active' ? 
                                        <th className="buyin-col"> </th>
                                        :
                                        <></>
                                    }
                                    {status === 'End' ? 
                                        <th className="cashout-col"> 
                                            Cashout Amount
                                        </th> 
                                        : 
                                        <></>
                                    }
                                </tr>
                            </thead>    

                            <tbody>
                                {Object.entries(netInvestment)
                                    .sort(([playerAID, aVal], [playerBID, bVal]) => {
                                        if (status === 'Active') {return bVal - aVal}
                                        return ((netEarnings[playerBID] + bVal) - (netEarnings[playerAID] + aVal))
                                    })
                                    .map(([playerID, amount], index) => (
                                        <tr key={playerID}>
                                            <td className="rank-col"> {index + 1} </td>
                                            <td className="player-col"> 
                                                <div style={{display: "flex", alignItems: "center", gap: 4}}>
                                                    <ProfilePicture size="small" url={players[playerID].profilePic} />
                                                    {players[playerID].displayName} 
                                                </div>
                                            </td>
                                            {status === 'End' ? 
                                                <td className={`bold winnings-col ${amount + netEarnings[playerID] <= 0 ? "red-text" : " green-text"}`}> 
                                                    {formatCurrency(amount + netEarnings[playerID])}
                                                </td> 
                                            : <></>}
                                            
                                            <td className={`invest-col ${status === 'Active' ? "red-text" : ""}`}> {formatCurrency(amount)} </td>
                                            {status === 'Active' ?
                                                <td className="buyin-col"> 
                                                    <button 
                                                        className="square vibrant-blue-bg"
                                                        onClick={() => playerBuyIn(playerID, players[playerID].displayName)}> 
                                                        Buy In
                                                    </button>
                                                </td>
                                                : <></>
                                            }   
                                            {status === 'End' ? 
                                                <td className="cashout-col"> 
                                                    {formatCurrency(netEarnings[playerID])}
                                                </td> 
                                            : <></>}
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{marginTop: 40, width: "100%", display: "flex", justifyContent: "center"}}>
                        {status === 'Active' ?
                            <button 
                                style={{padding: "4px 20px"}} className="pill coral"
                                onClick={() => {navigate(`/groups/${groupID}/end_game/${gameID}`)}}>
                                End Game & Cash Out
                            </button>

                            :

                            <div style={{padding: "4px 20px", opacity: 0.6}} className="pill coral">
                                Game has ended
                            </div>
                            }
                    </div>
                </div>
            </div>
        </div>
    )

}

export default Game;