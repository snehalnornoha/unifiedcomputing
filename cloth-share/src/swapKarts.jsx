import { useEffect, useState } from 'react';
import './my_Listing.css'


import { get_my_Kart,refrsh_jwt_token} from './controlers.jsx';
import {Kart_card ,Hist_card, Loading}  from './Kart.jsx'
import { useRef } from 'react';
import SharePage from "./share_page";

const API_URL = import.meta.env.VITE_API_URL;


 
        


function Kart(prop){
     const [myLists, setMyList] = useState([])
    const [myHistory, setMyHistory] = useState([])
    const  hist_next = useRef()
    const [isloading , setIsloading] = useState(false)
    const [isView , setIsView] = useState(false)
    const [slctd_item ,  setSlctd_item] = useState({})
    

    useEffect(( ) => {
        console.log("does")
        if(!prop.wishList.current.check && !prop.history.current.check){
            setMyHistory(prop.history.current.data)
            setMyList(prop.wishList.current.data)
            return
        }
        const get_items = async () => {
            const ans = await get_my_Kart(prop.wishList.current.check , prop.history.current.check,true)
            console.log(ans)
            if(ans.hist?.success && prop.history.current.check){    
                hist_next.current = ans.hist?.hasMore
                prop.history.current.data = ans.hist.data
                prop.history.current.check = false    
                setMyHistory(ans.hist.data)
            }
            else{
                setMyHistory(prop.history.current.data)
            }
            if(ans.hist?.success && prop.history.current.check){   
                prop.wishList.current.check = false
                prop.wishList.current.data = ans.wish.data
                setMyList(ans.wish.data)
            }  
             setMyList(prop.wishList.current.data )
        }

        get_items()
        
       
    }, [])


    const delete_wishList = async (selected_item ,is_refresh)=>{
         setIsloading(true)
      try {
             console.log("iam here")
             const res = await fetch(`${API_URL}/protectedApi/wishList`, {
                 method:"DELETE",
                 credentials: "include",
                 headers :{
              "Content-Type" : "application/json"
            },
                 body : JSON.stringify({prod_id : selected_item.id})
             });
             console.log(res)
     
             if (res.ok) {
                console.log("delete")
                 const data = await res.json();
                  setMyList(prev =>
                prev.filter(item => item.id !== selected_item.id)
                    );
                    setIsloading(false)

                return 
                 
             }
     
             else if (res.status === 401 && is_refresh) {
                 const refreshed = await refrsh_jwt_token();
     
                 if (refreshed.success) {
                     console.log("hi token rfreshed ")
                     delete_wishList(selected_item,false);
                 }
             }
             else { throw new Error(`Request failed: ${res.status}`);}
            
         }
         
      catch(error){
        alert("eroor while deleting" ,error)
      }
    }

    const show_wishList= (selected_item)=>{
        console.log("show",selected_item.brand)
        console.log("show",selected_item,isView)
        setSlctd_item(selected_item)
        setIsView(true)
    }

    if(isView){

                return(
                <SharePage setIsharepage={setIsView} clicked_item = {slctd_item} wishList={prop.wishList} all_users_requests = {prop.all_users_requests} ></SharePage>    
            )}

     else if(isloading){
        return(<Loading></Loading>)
     }
     else{

    return(
        <div className="myListing_parent">
            <div className="My-list-head">
                <div className="num-mylist" style={{ gridColumn: "span 2" }}><span className='head-title'>Wish Lists</span>{myLists.length}</div>
                <div className="num-mylist" style={{ gridColumn: "span 2" }}><span className='head-title'>Total swaps complted</span>{myHistory.length}</div>
                
            </div>
            <div className="myRequest">
                <div className='my-list-head'><h2>My WishList</h2> </div> 
             

            <div className='list-contenet'>
                {

                myLists.map((item,index)=>{       
                    return <Kart_card key={index} list_item = {item} bt1_text ={"show"} bt2_text ={"delete"}
                            bt1_act = {()=>{show_wishList(item)}} bt2_act = {()=>{delete_wishList(item ,true)}} />
                       
                                                    
                })
            }

            </div>
            </div>
            <div className="myRequest">
              <div className='my-list-head'><h2>My History</h2>  
              <button>{"next➡️"}</button> 
              </div> 

            <div className='list-contenet'>{
                myHistory.map((item,index)=>{
                    
                    return <Hist_card key={index} list_item = {item} />
                })
            }
            </div>
            </div>
        </div>
    )
}
}
export default Kart;