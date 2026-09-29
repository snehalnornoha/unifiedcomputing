import './chat_page.css'
import profile from './assets/profile.jpg'
import { useEffect, useState ,useRef} from 'react';
import { refrsh_jwt_token } from './controlers';
const API_URL = import.meta.env.VITE_API_URL;



function Chat_card(prop){

   const clicked_friend = (fr_id)=>{
        console.log("hiz", fr_id)
        
         prop.setFriend_id(fr_id)
         prop.setSelectedfriend(prop.friend)
         if (!prop.all_read_fid.current.includes(fr_id)) {
                prop.all_read_fid.current.push(fr_id);
            }
        console.log("--->",prop.friend_id,prop.all_read_fid)
        
        if(prop.chat_cntr.current.style.zIndex ==="-1"){
        prop.chat_cntr.current.style.zIndex = "1";
        prop.chat_home.current.style.zIndex = "-1";
        }else{
        prop.chat_cntr.current.style.zIndex = "-1";
        prop.chat_home.current.style.zIndex = "1";
        }
       
    }
    console.log("frnd",prop.friend)

    return(
        <div className="chat-user" onClick={()=>clicked_friend(prop.friend.id)}>
            <img src={prop.friend.profile_image_url ||profile}  className="user-image"></img>
            <div className="online_div">
            <span>{prop.friend.name}</span>
             <span className={prop.isOnline ? "Online" :"Offline"} >{prop.isOnline ? "Online" :"Offline"} </span>
             </div>
             {prop.friend.num_unread >0 &&<span className="num">{prop.friend.num_unread}</span>}
        </div>

    )
}

function Chat_page(prop){
    const [total_chats ,  setTotal_chats]= useState([]);
    const all_read_fid = useRef([])
 
    const chat_home = useRef(null)
    const chat_cntr= useRef(null)
    const [friends ,setFriends] = useState([])
    
    const [msg_text  ,setMsg_text ] = useState("")
    const user_id = useRef(prop.user_info.current.data.id)
    const [friend_id , setFriend_id]= useState(null)
    const [selectedfriend , setSelectedfriend]= useState(null)
    const [friendChats ,setFriendChats ]= useState([]);
    console.log("hbbjhbbj->",prop.user_info.current)

    const okSend = () =>{
        console.log(friend_id)
        if (msg_text.trim() === ""){
            alert("message is emptyr")
            return
        }
        setTotal_chats(prev => [...prev , {msgto: friend_id ,msgfrom:user_id.current , msg:msg_text}])
        prop.socket.current.emit("send_message", {To: friend_id , From:user_id.current , msg:msg_text});
     
        setFriendChats(prev =>
            prev.map(friend =>
                friend.friend_id === friend_id
                    ? {
                        ...friend,
                        chts: [...friend.chts, {msgto: friend_id ,msgfrom:user_id.current , msg:msg_text}]
                    }
                    : friend
            )
        );
          
        console.log("skhjjjjjjjjjjjjjjjj",friendChats)
          
      
    }

  const clicked_friend = (fr_id)=>{
     console.log("##@",fr_id)
     if(fr_id === ""){retrun}


    // Mark messages from this friend as read
        prop.All_chats.current.data = prop.All_chats.current.data.map(chat => {
            if (chat.msgfrom === fr_id) {
                return {
                    ...chat,
                    is_read: true
                };
            }

            return chat;
        });

 

    // Update friendChats unread count
    const frnd = friends
           setFriends( frnd.map(frnd => {
                if (frnd.id === fr_id) {
                    return {
                        ...frnd,
                        num_unread: 0
                       
                    };
                }

                return frnd;
            })
        );
        console.log("hiz")
        if(chat_cntr.current.style.zIndex ==="-1"){
        chat_cntr.current.style.zIndex = "1";
        chat_home.current.style.zIndex = "-1";
        }else{
        chat_cntr.current.style.zIndex = "-1";
        chat_home.current.style.zIndex = "1";
        }


    }
       

    useEffect(()=>{
        console.log("-------->",prop.friends.current.data)
        setFriends(prop.friends.current.data)
        const allCht = prop.All_chats.current.data || [];
        console.log("hi  all chat " ,allCht )
        
        
            const fChats = []
            for (const frnd of prop.friends.current.data) {
                const pchat = allCht.filter(
                    cht =>
                        cht.msgto === frnd.id ||
                        cht.msgfrom === frnd.id
                );
                

                fChats.push({
                    friend_id: frnd.id,
                    chts: pchat,
                    num_chts : pchat.length
                });

                const count =pchat.filter(cht => cht.msgfrom === frnd.id && cht.is_read === false).length
                console.log("count",count)
                frnd.num_unread  = count


            }

            console.log("Fchat",fChats);
            setFriendChats(fChats)


           
    },[prop.noti_length])
    useEffect(()=>{
        console.log("hi")
        if(!friend_id){return}

        const chats = friendChats.find(
               frch=> frch.friend_id === friend_id
                    )?.chts || [];
        
        setTotal_chats(chats);
    }, [friend_id, friendChats])

    useEffect(()=>{
        console.log("h------------i",friends)   
         return()=>{
                ////
                const delchdata = async(is_refresh)=>{
                        try{
                            
                            const res = await fetch(`${API_URL}/protectedApi/chats_read`, {
                                method: "PUT",
                                credentials: "include",
                                headers :{
                                "Content-Type" : "application/json"
                                },
                                body : JSON.stringify({ids : all_read_fid.current})

                            });
                                if (res.ok) {
                                    console.log("hi")
                                    }
                                    
                            
                            else if (res.status === 401 && is_refresh) {
                                        const refreshed = await refrsh_jwt_token();
                            
                                        if (refreshed.success) {
                                            console.log("hi token rfreshed ")
                                            return delchdata(false);
                                        }
                                    }
                            else{
                                    throw new Error(`Request failed: ${res.status}`);
                                    }

                                    
                                    
                                }
                
                        catch(err){
                            alert(err)
                        }

                }

                delchdata(true)
                ///
            }  


     },[]);

  

    return(
        <div className="chat-parent">
    <div ref= {chat_home} className="chat-home">
            <span className="chat-search" >Total friends : {friends.length||0}</span>
            <input className="chat-search" type="text" placeholder="SEARCH" />
            
            
            {friends?.map((friend, index) => {
                const isOnline = prop.onlineFriend.includes(friend.id);
                console.log("num",friend.num_unread)

                        return(<Chat_card
                                key={index}
                                friend={friend}
                                chat_cntr={chat_cntr}
                                chat_home={chat_home}
                                friend_id = {friend_id}
                                setFriend_id = {setFriend_id}
                                isOnline = {isOnline}
                                setSelectedfriend={setSelectedfriend}
                                all_read_fid ={all_read_fid}
                                
                            />
                        ) }
                        )}
    </div>

    <div ref= {chat_cntr}className="chat-container">

        <div className="chat-header">
            <img src={selectedfriend?.profile_image_url || profile} className="user-image"></img>

            <div className="user-info">
                  <div className="user-info">
              <span> <strong>{selectedfriend?.name}</strong></span>  

             { 
                <span className={prop.onlineFriend.includes(selectedfriend?.id)? "Online" :"Offline"} >
                    {prop.onlineFriend.includes(selectedfriend?.id) ? "Online" :"Offline"} </span>
            }
             </div>
                

                
            </div>
             <button className='back_btn' onClick={()=>clicked_friend(selectedfriend?.id)}>{"← Back"}</button>
        </div>


        <div className="chat-messages">
            
        
               {
                
                total_chats?.map((chat , index) =>{
                              
                               return(

                               
                               <div className={chat.msgfrom === user_id.current ?'user-msg' :'friend-msg'} key = {index}>
                                     <p>{chat.msg}</p>
                                     </div> 
                                    )
                            
                            }
                            
                        
                )
    
            }
        </div>


        <div className="chat-input">
            <input  type="text" placeholder="Type a message..."onChange={(e)=>setMsg_text(e.target.value)} />
            <button onClick={() => okSend() }>➤</button>
        </div>

    </div>

</div>
    )
}



export default Chat_page;


                