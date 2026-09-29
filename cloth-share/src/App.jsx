import { useState , useRef ,useEffect} from 'react'
import "./assets/clothShareBackground.png"

import { FaBell } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import  UploadClothing  from'./upload_cloth.jsx'
import { BrowserRouter, Routes, Route, Link ,useNavigate} from "react-router-dom";
import { refrsh_jwt_token}  from './controlers.jsx'
const API_URL = import.meta.env.VITE_API_URL;





import './App.css'

import Auth from './login&up_page.jsx'
import Start_page from './home_page.jsx'
import profile_img from "./assets/profile.jpg";
import logo from "./assets/company_logo.png";
import Kart from './swapKarts.jsx';
import MyListing from "./my_Listing.jsx";
import Chat_page  from './chat_page.jsx';
import ForgotPassword from './forget_pass.jsx';
import Edit_profile from './Edit_profile.jsx';
import  Fianl_swap from  './final_swap.jsx'
import { io } from "socket.io-client";

import Notificationpage from './Notification.jsx'
import { use } from 'react';






function App() {
  const navi = useNavigate()
  const menu_v = useRef();
  const profile_edit = useRef();
  const [ismenuD , setIsmenuD] = useState(true);
  const [isProfile , setIsProfile] = useState(false);
  const [islogedin  , setIslogedin ] = useState(false);
  const [ noti_length , setNoti_length] =useState(0);
  const [onlineFriend , setOnlineFriend] = useState([])
 
  const  [search ,setSearch] = useState("")
  const  [searching_type ,setSearching_type] = useState("location")
  const   [searching_factor , setSearching_factor] = useState("")
  const socketRef = useRef(null);
  const logout = async (is_refresh) => {
    console.log("logging out")
    try {
        const res = await fetch(`${API_URL}/protectedApi/logout`, {
            method: "POST",
            credentials: "include"
        });

        if (res.ok) {
            const result = await res.json();
            console.log(result);

            // logout successful
            setIslogedin(false);
            user_info.current.data = {}
            Notification.current.data = []
            All_chats.current.data = []
            friends.current.data = []
            wishList.current.data = [{}]
            history.current.data = [{}]
            all_users_requests.current.data = [{}]
            
            
        } else if (res.status === 401 && is_refresh) {
                const refreshed = await refrsh_jwt_token();

                if (refreshed.success && isMounted) {
                    console.log("hi token rfreshed");
                    logout(false);
                }
            }

        else {
            throw new Error(`Logout failed: ${res.status}`);
        }

    } catch (err) {
        console.log(err);
        alert("log out error : pls try again");
    }
};
  

  const need_refresh = useRef({
    check: true,
    search: false,
    data: []
});
  const Notification = useRef({
    check: true,
    data: []
});
  const All_chats = useRef({
    check: true,
    data: []
});
  const friends = useRef({
    check: true,
    data: []
});
  const user_info = useRef({
    check: true,
    data: []
});
  const wishList = useRef({
    check:true,
    data:[{}]
  })
  const history = useRef({
    check:true,
    data:[{}]
  })
  const all_users_requests = useRef({
    check:true,
    data:[{}]
  })
  const chat_isseen = (cht,uuid)=>{
    console.log(cht ,uuid)
    if(cht.is_read || cht.msgfrom === uuid ){return}
    console.log(cht.msgfrom === user_info.current.data.id )
    Notification.current.data = [...Notification.current.data , 
                                { id: cht.id, type: "chat-msg", msg: `msg : ${cht.msg}` }]

  }

  const searchfunc = async()=>{
    let temp = false
    console.log(searching_type)
    if(search === "" || searching_type === ""){return alert(" type the searching text")}
   
    console.log("why ")
    temp = { searching_type: searching_type, text :search, bysearch : true } 
  
  
    console.log("--->",temp)
    
    if(temp){
    setSearching_factor(temp)
    need_refresh.current.search = true
    }

  }
  

  const sayhi = (isis)=>{
    console.log(isis , "blablab" ,isProfile)
    display_profile()
    
    navi(`/edit_profile`)

  }
  const open_notification = ()=>{
    navi('/Noti')
  }


  const menu_apear = ()=>{
      if(!islogedin){
        alert("please log in")
        return
      }
      setIsmenuD(!ismenuD)
   
      if(!ismenuD){
          menu_v.current.style.display = "none"
          
      }
      else
          menu_v.current.style.display = "flex"


    }

  const display_profile = ()=>{
     if(!islogedin){
        alert("please log in")
        return
      }
        setIsProfile(!isProfile)
   
      if(profile_edit.current.style.display === "flex"){
          profile_edit.current.style.display = "none" 
      }
      else{
          profile_edit.current.style.display = "flex"
      }
     
  }

  useEffect(()=>{
    return()=>{

        logout(true)
    }
  },[])

//websokt
  useEffect(() => {

    if (!islogedin) {return}

    const socket = io(`${API_URL}`, {
        withCredentials: true
    });

    socketRef.current = socket;

    socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
        console.log("Socket error:", err.message);
    });

    socket.on("new_message", (data) => {
            console.log("kjbkjkjnkjnf------------------>",data)
            console.log("kjbkjkjnkjnf------------------>",user_info.current.data.id)
            All_chats.current.data = [...All_chats.current.data,data]
            chat_isseen(data,user_info.current.data.id)
            setNoti_length(prev => prev+1)
           

        })


     
    socket.on("friends_online", (onlineFriends_ids) => {
      console.log("lallalla:",onlineFriends_ids)
        setOnlineFriend(onlineFriends_ids)
    });

    socket.on("friend_online", (friendId) => {
      console.log("just connected:",friendId)
        setOnlineFriend(prev => [
            ...new Set([...prev, friendId])
        ]);
    });

    socket.on("friend_offline", (friendId) => {
      console.log("why he he is offline", friendId)
        setOnlineFriend(prev =>
            prev.filter(id => id !== friendId)
        );
    });




    const handleNotification = (data) => {
        console.log("Notification received:", data);
        console.log("Notification shit received:",Notification.current.data );
        Notification.current.data = [...Notification.current.data,{id : data.id , type : data.type , msg : data.msg}]
        console.log("Notification:", Notification.current.data)
        
        if(data.type === "Swap Request"){
          all_users_requests.current.check = true   
          
        }else if(data.type ==="Swap Transaction" ){
          console.log("hi")

        }
        setNoti_length(prev => prev+1);

    };

    socket.on("notification", handleNotification);

        return () => {
    socket.off("notification", handleNotification);
    socket.disconnect();
    socket.off("new_message");
    socket.off("friends_online");
    socket.off("friend_online");
    socket.off("friend_offline");

    if (socketRef.current === socket) {
        socketRef.current = null;
    }}
}, [islogedin]);


useEffect(()=>{
 console.log("noti toggle",noti_length)
},[noti_length])


useEffect( ()=> {
    console.log("jhi")
     if (!islogedin || !Notification.current.check) {return}
    const fetchdata = async(is_refresh)=>{
        try{
            
            const res = await fetch(`${API_URL}/protectedApi/all_noti`, {
                method: "GET",
                credentials: "include"
            });
                if (res.ok) {
                    
                    const results = await res.json()
                    console.log("Notification by db :",results)
                    Notification.current.data = results.data
                    Notification.current.check = false
                    const count = Notification.current.data.length || 0
                    setNoti_length(prev => prev+count);
                    }
                    
            
            else if (res.status === 401 && is_refresh) {
                        const refreshed = await refrsh_jwt_token();
            
                        if (refreshed.success) {
                            console.log("hi token rfreshed ")
                            return fetchdata(false);
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

    fetchdata(true);
    
  },[islogedin]);
useEffect( ()=> {
      
      console.log("jhi")
      if (!islogedin || !All_chats.current.check) {return}
      const fetchdata = async(is_refresh)=>{
          try{
              
              const res = await fetch(`${API_URL}/protectedApi/all_chats`, {
                  method: "GET",
                  credentials: "include"
              });
                  if (res.ok) {
                      const result = await res.json();
                      //setFriends(result.message);
                      const allcht =  result.data
                      All_chats.current.data = result.data
                      All_chats.current.check = false
                      const uuid = result.uid
                      console.log("Chats :",result)
                      console.log(typeof(result.data))
                      allcht.map(cht => chat_isseen(cht ,uuid))
                      const count = Notification.current.data.length || 0
                       setNoti_length(prev => prev+count);
                      
                      
                      }
                      
              
              else if (res.status === 401 && is_refresh) {
                          const refreshed = await refrsh_jwt_token();
              
                          if (refreshed.success) {
                              console.log("hi token rfreshed ")
                              return fetchdata(false);
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
      
      fetchdata(true);
      
  },[islogedin]);

useEffect( ()=> {
    if(!friends.current.check || !islogedin){console.log("no paji refresh"); return}
    console.log("jhi paji")
    const fetchdata = async(is_refresh)=>{
        try{
            
            const res = await fetch(`${API_URL}/protectedApi/friends`, {
                method: "GET",
                credentials: "include"
            });
                if (res.ok) {
                    const result = await res.json();
                    
                    friends.current.data = result.data
                    friends.current.check = false
                    console.log("jdjjd",result)
                    console.log(typeof(result.data))
                    }
                    
            
            else if (res.status === 401 && is_refresh) {
                        const refreshed = await refrsh_jwt_token();
            
                        if (refreshed.success) {
                            console.log("hi token rfreshed ")
                            return fetchdata(false);
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

    fetchdata(true);
    
},[islogedin, ismenuD]);
 

  return (
    <div className="App_parent">
       <div className="App-child1"> 
         
                <div className="child1_left2">
                    <button onClick={() => menu_apear()} className="Menu_btn"> 
                        <div className={ismenuD ?"menu-div" : "menu-div-change"}/>
                        <div className="menu-div2" style={ismenuD?{display: "block"}:{display:"none"}}></div>
                        <div className={ismenuD?"menu-div3":"menu-div3-change"}></div> 
                    </button>
                    <img className="app_logo" src={logo}></img>
                    <h1 className="appname2">Cloth Share</h1>
                </div>
                <div className="child1_left">
                      <div className="search_bar"> 
                        <select defaultValue="" onChange={(e)=>{
                            setSearching_type(e.target.value)
                            console.log(e.target.value)
                            if(e.target.value === "state"){
                              alert("enter only the state name")
                            }
                        }} >
                        <option value="">""</option>
                        <option value="state">🌍</option>
                        <option value="brand">🏷️</option>
                        <option value="category">👕</option>
                      </select>
                        <input type="search" placeholder='Search community items'
                        onChange={(e)=>{setSearch(e.target.value)}}></input>
                        <button
                        onClick={()=>searchfunc() } >🔍</button>
                        </div>
                        <div className="bell_container" onClick={()=>open_notification()}>
                       <FaBell className= "bell" onClick={() =>console.log("hi")} size={24}/>
                        {noti_length > 0 &&<div>{noti_length}</div>}
                        </div>
                      {!islogedin ?  <div className='login-logo'><FaUserCircle className= "usercircle" size={20} / > <Link className='login_link' to ="/logpage" >Log in / Sign up </Link></div>:<>   
                        {isProfile? <div className="profile_back" onClick={()=> display_profile()}></div>:
                      <img onClick={()=>display_profile()} className="profile_IMG" src={user_info.current.data.profile_image_url  ||profile_img}></img>
                        }
                        </>
                        }
                    
                  </div>
                

        </div>
        <div className="App-child2">
             <div ref={menu_v} className="child_menu">
              

              <Link to="/" className="menu-item">Dashboard</Link>
              <Link className="menu-item" to ="/clothUpload" >Upload Clothes</Link>
              <Link  to = "/myList" className="menu-item">My Listings</Link>
              
              <Link to = "/wish" className="menu-item">Wish List</Link>
              <Link to = "/myList" className="menu-item">Swap Requests</Link>
              <Link to = "/chat" className="menu-item">Messages / Chat</Link>
              <Link to = "/Final" className="menu-item">Swap Complete</Link>
              <p className="menu-item" onClick={()=>display_profile()}>Profile</p>
              <p className="menu-item" onClick = {()=>logout(true)} >Logout</p>
              

             </div>
             
             <div   className="child_profile1" ref = {profile_edit} >
                
                    <span className="profile_img_span"><img className="profile_img_span" src={user_info.current.data?.profile_image_url||profile_img}></img></span><br></br>
      
                    <span className="profile-span"><b>Name</b> : {user_info.current.data?.name} </span>
                    <span className="profile-span"><b>Email</b>   : {user_info.current.data?.email} </span>
                    <span className="profile-span"><b>Reputation</b>   : {user_info.current.data?.reputation_score} </span>
                    <span className="profile-span"><b>Total_swaps</b>   : {user_info.current.data?.total_swaps} </span>
                    <span className="profile-span"><b>Location</b> : <a><br></br>country : {user_info.current.data?.location?.country}<br></br>state : {user_info.current.data?.location?.state}<br></br>pincode :{user_info.current.data?.location?.pin}
                        </a></span>
                        <span></span>

                        <button onClick = {()=>sayhi(true)} className="edit_profile-btn">Edit profile</button>
                        <button onClick = {()=>logout(true)} className="edit_profile-btn">Logout</button>

            </div>
            
            <div className="App-content">
            <Routes>
                <Route path= "/" element={<Start_page key ="home" searching_factor = {searching_factor}  need_refresh = {need_refresh}
                islogedin = { islogedin} user_info = {user_info}   is_edit_propfile= {true}
                wishList = {wishList}  all_users_requests={all_users_requests}/>} />  
                <Route path= "/wish" element={<Kart wishList ={wishList} history ={history}  all_users_requests= {all_users_requests}  />} />
                <Route path= "/myList" element={<MyListing  all_users_requests= {all_users_requests}  wishList = {wishList}/>} />
                <Route path= "/chat" element={<Chat_page  user_info ={user_info} socket = {socketRef} All_chats ={All_chats} noti_length = {noti_length} onlineFriend = {onlineFriend} friends = {friends}/>} />
                <Route path= "/clothUpload" element={<UploadClothing/>} />
                <Route path= "/logpage" element={<Auth setIslogedin ={setIslogedin}/>} />
                <Route path='/reset'  element={<ForgotPassword/>} />
                <Route path='/edit_profile'  element={<Start_page searching_factor = {searching_factor} setIn_c_profile ={"undefined"} need_refresh = {need_refresh}
                islogedin = { islogedin} user_info = {user_info}  is_edit_propfile= {false}
                wishList = {wishList} all_users_requests= {all_users_requests}/>} />

                <Route path='/Noti'  element={<Notificationpage Notification = {Notification} setNoti_length = {setNoti_length}/>} />
                <Route path='/Final'  element={<Fianl_swap user_info = {user_info}/>} />
            </Routes>
            </div>
            
          

        </div>
   
               
    </div>
      

    
  )
}

export default App

  