import React, {useState, useEffect, useContext} from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../api/api";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faTrophy } from "@fortawesome/free-solid-svg-icons";
import {formatCurrency} from "../../utils"

import AuthContext from "../../context/AuthProvider";
import ProfilePicture from "../ProfilePicture";
import Chip from "../Chip";

function EndGame() {
    const navigate = useNavigate();
    const {auth} = useContext(AuthContext);
    const {groupID, gameID} = useParams();

    const [chips, setChips] = useState(new Map());
    const [earnings, setEarnings] = useState({});
    const [investment, setInvestment] = useState({});
    const [name, setName] = useState("");
    const [players, setPlayers] = useState({});
    const [chipQuantity, setChipQuantity] = useState({});
    const [totalInvestment, setTotalInvestment] = useState(0);
    const [totalCashout, setTotalCashout] = useState(0);

    const [netWinnings, setNetWinnings] = useState({});

    const fetchGameData = () => {
        apiClient.post(`/api/games/get_game`,
            {groupID, gameID},
            {headers: {Authorization: `Bearer ${auth?.accessToken}`}, withCredentials: true}
        ).then((res) => {
            setChips(new Map(Object.entries(res.data.game.chipValues)));
            setInvestment(res.data.game.investment);
            setEarnings(res.data.game.earnings);
            setName(res.data.game.sessionName);

            setPlayers(res.data.players);

            Object.entries(res.data.players).forEach(([userID]) => {
                setChipQuantity(prev => ({
                    ...prev,
                    [userID] : {}
                }));
            })
        }).catch((err) => console.error(err))
    }

    useEffect(() => {
        fetchGameData();
    }, [gameID, groupID, auth?.accessToken]);

    const handleQuantityUpdate = ({userID, color, amount}) => {
        setChipQuantity(prev => ({
            ...prev,
            [userID] : {
                ...prev[userID],
                [color]: amount
            }
        }));
    }

    const handleNext = () => {
        setTotalInvestment(0);
        Object.entries(investment).forEach(([players, amount]) => {
            setTotalInvestment(prev => prev + amount);
        })

        setTotalCashout(0);

        Object.entries(chipQuantity).forEach(([userID, amounts]) => {
            Object.entries(amounts).forEach(([color, quantity]) => {
                setTotalCashout(prev => prev + (chips.get(color) * quantity));
            })
        });

        if (totalCashout === (totalInvestment * -1)) {
            Object.entries(chipQuantity).forEach(([userID, amounts]) => {
                let chipEarnings = 0;
                Object.entries(amounts).forEach(([color, quantity]) => {
                    chipEarnings += chips.get(color) * quantity;
                })
                
                setEarnings(prev => ({
                    ...prev,
                    [userID]: chipEarnings
                }))
            });

            apiClient.post('/api/games/end_game',
                {groupID, gameID, userID: auth.userID, earnings, chipQuantity},
                {headers: {Authorization: `Bearer ${auth?.accessToken}`}, withCredentials: true}
            ).then((res) => {
                if (res.status === 204) {
                    navigate(`/groups/${groupID}/game/${gameID}`);
                }
            }).catch((err) => console.error(err))
        }
    }

    useEffect(() => {
        Object.entries(chipQuantity).forEach(([userID, amounts]) => {
                let chipEarnings = 0;
                Object.entries(amounts).forEach(([color, quantity]) => {
                    chipEarnings += chips.get(color) * quantity;
                })
                
                setEarnings(prev => ({
                    ...prev,
                    [userID]: chipEarnings
                }))
            });
    }, [chipQuantity, chips])

    return (
        <div className="page">
            <div className="content"> 
                <div className="h-between">
                    <h1> End Game 
                        <span className="vibrant-blue">
                            {" "} "{name}" {" "} 
                        </span> & Cash Out </h1>
                    <button onClick={() => navigate(`/groups/${groupID}/game/${gameID}`)}>
                        <FontAwesomeIcon icon={faTimes} size="lg"/>
                    </button>        
                </div>
                
                <h2> Add Up Player Chips </h2>
                <p> Enter the amount of chips each player has. </p>
                <div style={{marginTop: 24}}>
                    {Object.entries(players).map(([userID, playerInfo]) => (
                        <div style={{margin: "32px 0px"}}>
                            <div style={{display: "flex", alignItems: "center", gap: 8}}>
                                <ProfilePicture url={playerInfo.profilePic} size="med"/>
                                <h3> {playerInfo.displayName} </h3>
                                <h6> {formatCurrency(earnings[userID])} </h6>
                            </div>
                            
                            <div style={{display: "flex", gap: 20, margin: "12px 0px", flexWrap: "wrap"}}>
                                {[...chips.entries()]
                                    .sort(([, aAmount], [, bAmount]) => aAmount - bAmount)
                                    .map(([color, amount]) => (
                                    <div key={color} className="flex-column" style={{alignItems: "center", gap: 8}}>
                                        <Chip size={80} color={color}/>
                                        <p> {formatCurrency(amount)}</p>
                                        <input
                                            value={chipQuantity[userID]?.[color] ?? ""}
                                            onChange={(e) => {handleQuantityUpdate({userID, color, amount: e.target.value})}}
                                            style={{width: 20}}/>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <button 
                    style={{fontSize: 20, padding: "4px 20px"}}
                    className="vibrant-blue-bg pill"
                    onClick={handleNext}>
                    Next 
                </button>

                {totalCashout === (totalInvestment * -1) ? <></> :
                    <p className="red-text"> Please make sure the total chip quantity adds up to total buy-ins (${totalInvestment * -1}).
                    Your current chip totals add up to ${totalCashout}.
                    </p>}
            </div>
            
        </div>
    )
};

export default EndGame;