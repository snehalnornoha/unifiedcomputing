import { useEffect, useState } from 'react';
import './Notification.css';
import {useNavigate ,Link} from "react-router-dom";

import { refrsh_jwt_token} from './controlers.jsx';

const NoticCard = ({ notification ,direct }) => {
    console.log(notification)
    
    let when = notification.created_at || "Just now"

    return (
        <div className="notic-card">
            <div className="notic-icon">
                🔔
            </div>

            <div className="notic-content">
                <p>{notification.msg}</p>
                <span>{when}</span>
            </div>
            <Link to={direct}>see</Link>
        </div>
    );
};


function Notificationpage(prop) {
    const navi  = useNavigate()

    const [chats , setChats ] = useState([]);


    const [others ,setOthers ]  = useState([])
     
    useEffect(()=>{
        const all_noti = prop.Notification.current.data ||[]
        const chat_noti = all_noti?.filter(noti => noti.type === "chat-msg" )
        const other_noti = all_noti?.filter(noti => noti.type !== "chat-msg" )
        console.log(chat_noti ,other_noti)
        setChats(chat_noti)
        setOthers(other_noti)

        return()=>{
            const send_seen = async(one_time_refresh)=>{
              try {
                        const res = await fetch("http://localhost:8000/protectedApi/noti_seen", {
                            method: "GET",
                            credentials: "include",
                        });
            
                        if(res.ok){
                            const data = await res.json();
                            console.log(data);
                        }
            
                        else if(res.status === 401 && one_time_refresh){
                            const refreshed = await refrsh_jwt_token()
                            if (refreshed.success) {
                                send_seen(false);
                            }
                        }
            
                        else{
                            throw new Error("access denied pls try again");
                        }
            
                } catch(error) {
                    console.error("Error:", error);
                }
            }
            prop.setNoti_length(0)
            send_seen(true)
        }
    },[])

    return (
        <div className="notification-page">

            <div className="notification-header">
                <h1>Notifications</h1>
                <button onClick={()=> navi('/')}>Back</button>
              
            </div>


            {chats.length > 0 && (
                <section className="notification-section">

                    <h2>Chats</h2>

                    <div className="notification-list">
                        {chats.map((not,indx) => (
                            <NoticCard
                                key={indx}
                                notification={not}
                                direct ='/chat'
                            />
                        ))}
                    </div>

                </section>
            )}


            {others.length > 0 && (
                <section className="notification-section">

                    <h2>Others</h2>

                    <div className="notification-list">
                        {others.map((not , indx) => (
                            <NoticCard
                                key={indx}
                                notification={not}
                                direct = {not.type==="Swap Request"? '/myList' :'/Final' } 
                            />
                        ))}
                    </div>

                </section>
            )}

        </div>
    );
}

export default Notificationpage;