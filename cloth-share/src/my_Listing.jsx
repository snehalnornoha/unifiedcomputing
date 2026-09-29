import { useEffect, useRef, useState } from 'react';
import './my_Listing.css'
import {Kart_card, Loading}  from './Kart.jsx'
import { refrsh_jwt_token,get_my_Listing ,get_my_Request} from './controlers.jsx';
import SharePage from "./share_page";
import Reply_req from './req_reply.jsx';


 const all_resreqs_call = async(one_time_refresh)=>{
    console.log("in fecth ")
     try {
                const res = await fetch("http://localhost:8000/protectedApi/all_resreqs", {
                    method: "GET",
                    credentials: "include",
                });
    
                if(res.ok){
                    console.log(res);
                    const data = await res.json();
                    console.log("from fecth",data)
                    return data  
                 
                } else if(res.status === 401 && one_time_refresh){
                    const refreshed = await refrsh_jwt_token();
                    if (refreshed.success) {
                        all_resreqs_call(false);
                    }
                }else{
                    throw new Error("access denied pls try again");
                }
    
            } catch(error) {
                console.error("Error:", error);
            }

 }
        


function MyListing(prop){
    const [myLists , setMyList] = useState([])
    const [myRequests , setMyRequests] = useState([])
    const [isSharepage , setIsSharepage] = useState(false)
    const [isreq_reply , setIsreq_reply] = useState(false)
    const [slctd_item ,  setSlctd_item] = useState({})
    const [reqres_item ,  setReqres_item] = useState([])
    const [owner_prod ,  seOwner_prod] = useState({})
    const [isloading , setIsloading] = useState(false)
    let  rejected_length = ""
    useEffect(()=>{
        console.log("does",prop.all_users_requests.current.check)
        const get_items = async()=>{
        const ans = await get_my_Listing (true)
        if(prop.all_users_requests.current.check){
            const ans2 = await get_my_Request(true)
            if(ans2.success){
                console.log("hybaye enjoy",ans2.data)
              setMyRequests(ans2.data)
              prop.all_users_requests.current.data = ans2.data
              prop.all_users_requests.current.check = false
              
            }
        }
        else{
            setMyRequests(prop.all_users_requests.current.data)

        }
        
        if(ans.success){   
            setMyList(ans.data)     
        }
        
        
        }
        get_items()
        rejected_length = myRequests?.map(itm => itm.status === "rejected").length
    },[])

    useEffect(()=>{
        console.log("--------------------------")
        const retrive = async()=>{
        const data = await all_resreqs_call(true)
        console.log(data)
        if(data.success){ 
            console.log("success")
            const grouped = Object.values(
                data.data.reduce((groups, item) => {
                    const id = item.owner_cloth_id;

                    if (!groups[id]) {
                        groups[id] = {
                            id: id,
                            data: []
                        };
                    }

                    groups[id].data.push(item);

                    return groups;
                }, {})

            );
             setReqres_item(grouped)
             console.log("gggggrrrrrrrrrrrrrroupppeddd" , grouped)

        }else{
            alert("error while loading the requests for you listings")
        }
    }
    retrive()
    },[])
      const delete_myListing =async (selected_item ,is_refresh)=>{

        const ANS = confirm("Are you really sure you want to delete this product?")
        if(!ANS)return ;
         setIsloading(true)
      try {
             console.log("iam here")
             const res = await fetch("http://localhost:8000/protectedApi/myListing", {
                 method:"DELETE",
                 credentials: "include",
                 headers :{
              "Content-Type" : "application/json"
            },
                 body : JSON.stringify({prod_id : selected_item.id , produrl:[selected_item.img1,selected_item.img2,selected_item.img3]})
             });
             console.log(res)
     
             if (res.ok) {
                 const data = await res.json();
                 setMyList(prev =>
                prev.filter(item => item.id !== selected_item.id)
                    );
                 setIsloading(false)

                    return
                 
                 
             }
     
             if (res.status === 401 && is_refresh) {
                 const refreshed = await refrsh_jwt_token();
     
                 if (refreshed.success) {
                     console.log("hi token rfreshed ")
                    delete_myListing(selected_item,false);
                 }
             }
     
             throw new Error(`Request failed: ${res.status}`);          
         }  
      catch(error){
        alert("eroor while deleting" ,error)
        console
      }
    }
      const delete_myrequest =async (selected_item , is_refresh)=>{
        const ANS = confirm("Are you really sure you want to delete this product?")
        if(!ANS)return ;
         setIsloading(true)
      try {
             console.log("iam here")
             const res = await fetch("http://localhost:8000/protectedApi/swap_request", {
                 method:"DELETE",
                 credentials: "include",
                 headers :{
              "Content-Type" : "application/json"
            },
                 body : JSON.stringify({swap_id: selected_item.swrq_id})
             });
             console.log(res)
     
             if (res.ok) {
                 const data = await res.json();
                
                const prv = myRequests.filter(item => item.id !== selected_item.id)
                

                    setMyRequests(prv)
                    prop.all_users_requests.current.data= prv
                     setIsloading(false)

                    return 
                
                 
             }
     
             if (res.status === 401 && is_refresh) {
                 const refreshed = await refrsh_jwt_token();
     
                 if (refreshed.success) {
                     console.log("hi token rfreshed ")
                      delete_myrequest(selected_item,false);
                 }
             }
     
             throw new Error(`Request failed: ${res.status}`);
            
         }
         
      catch(error){
        alert("eroor while deleting")
      }
    }

    const show_req = (selected_item)=>{
        
        console.log("show",selected_item.brand)
        console.log("show",selected_item,isSharepage)
        setSlctd_item(selected_item)
        setIsSharepage(true)
    }

    const reply_the_request = (all_reply) => {
    console.log("clicked listing:", all_reply.id);
    console.log("all grouped requests:", reqres_item);
    seOwner_prod(all_reply)

    const selected = reqres_item.find(
        itm => Number(itm.id) === Number(all_reply.id)
    );

    console.log("selected:", selected);

    if (!selected) {
        console.log("No requests found for listing:", all_reply.id);
        return;
    }
    console.log(selected.data)
    setSlctd_item(selected);
    setIsreq_reply(true);
};
    if(isSharepage){

                return(
                <SharePage setIsharepage={setIsSharepage} clicked_item = {slctd_item} wishList={prop.wishList} all_users_requests = {prop.all_users_requests} ></SharePage>    
            )}
    else if(isreq_reply){
           return(
            <Reply_req   owner_prod = {owner_prod } setIsreq_reply={setIsreq_reply}  swap_id={slctd_item.id} selected_items={slctd_item.data}  setReqres_item= {setReqres_item} all_users_requests = {prop.all_users_requests} ></Reply_req>
            )}
    else if(isloading){
        return(<Loading></Loading>)

    }
    else{
    return(
        <div className="myListing_parent">
            <div className="My-list-head">
                <div className="num-mylist"><span className='head-title'>Total Listing</span>{myLists?.length}</div>
                <div className="num-mylist"><span className='head-title'>Total Request</span>{myRequests?.length}</div>
                <div className="num-mylist"><span className='head-title'>Listing Response</span>{reqres_item.length}</div>
                <div className="num-mylist"><span className='head-title'>Rejected Response</span>{rejected_length||0}</div>
              
                


            </div>
            <div className="myRequest">
                <div className='my-list-head'><h2>My Listing </h2> <button>+upload</button></div> 
             

            <div className='list-contenet'>
                {

                myLists?.map((item,index)=>{
                    const check_temp = reqres_item.find(itm =>itm.id === item.id)
                    let kart_num_status= "no request"
                    if(check_temp){
                    const is_any_req =check_temp.data.length || 0 
                    kart_num_status = `Request :${is_any_req}`
                    }
                    
                    return <Kart_card key={index} list_item = {item} kart_status ={kart_num_status} bt1_text ={"show"} bt2_text ={"delete"}
                                        bt1_act = {()=>{reply_the_request(item)}} bt2_act = {()=>{delete_myListing(item , true)}} />
                })
            }

            </div>
            </div>
            <div className="myRequest">
                <h2>My request</h2>

            <div className='list-contenet'>{
                myRequests?.map((item,index)=>{
                    console.log("my request",item)
                    
                    return (
                    
                    <Kart_card key={index} list_item = {item} kart_status ={item.swrq_status}  bt1_text ={"show"} bt2_text ={"delete"}
                                        bt1_act = {()=>{show_req(item)}} bt2_act = {()=>{delete_myrequest(item ,true)}} />)
                })
            }
            </div>
            </div>
        </div>
    )
}
}
export default MyListing;