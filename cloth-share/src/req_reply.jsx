import { useEffect, useState } from "react";
import  "./share_page.css";
import profile_img from "./assets/react.svg";
import { refrsh_jwt_token} from './controlers.jsx';import { useNavigate } from "react-router-dom";
import { Loading } from "./Kart.jsx";
;


function Reply_req(prop){
    console.log(".................",prop.selected_items[0],prop.selected_items.length)
    const [selected_items ,setSelected_items] = useState()
    const [show_item ,setShow_item ] = useState(prop.selected_items[0])
    let sltd_length  = prop.selected_items.length ||0
    const [item_owner ,setItemOwner] = useState("")
    const [allitemOwner,setAllitemOwner] = useState("")
    const navi = useNavigate()
    const [isloading , setIsloading] = useState(false)

    

    const show_req1 = ()=>{
        setShow_item(selected_items[0])

    }
    const show_req2 = ()=>{
        setShow_item(selected_items[1])
  
    }
    const show_req3 = ()=>{
        setShow_item(selected_items[2])
     
    }
    const  show_nxt =()=>{
        const all_req = selected_items 
        const index = all_req.findIndex(req => req.id === show_item.id);
        const nextIndex = (index + 1) % all_req.length;
        setShow_item(all_req[nextIndex]);
    }
   
        useEffect(()=>{
            setSelected_items(prop.selected_items)
            const owner_ids =selected_items?.map(itm => itm.user_id)
            console.log("owner ids:----->", owner_ids)

            const load_owner =async (is_refresh)=>{ 

                try{
                const res = await fetch("http://localhost:8000/protectedApi/get_owner_info_multi", {
                    method: "POST",
                    credentials: "include",
                    headers:{
                        "Content-Type": "application/json"
                    },
                    body:JSON.stringify({owner_id : owner_ids})
    
    
                    })
                    if(res.ok){
                       
                        const data = await res.json();
                         console.log("multi" , data)
                         setAllitemOwner(data.owner)
                        

                      
                    }
                    else if(res.status === 401 && is_refresh){
                        const refreshed = await refrsh_jwt_token()
                        if(refreshed.success){
                            load_owner(false)
                        }
                        
                    }
                    else{
                        throw new Exception("something went wrong , please try again")
                    }
                }
                catch(error){
                    console.log(error)
                }
              
    
    
            }
            load_owner(true)

            
   
    
         },[])
    
    


        useEffect(()=>{
            if(!allitemOwner){return}
            console.log(show_item)
            console.log("shown oner", allitemOwner, show_item.user_id)
            const infO= allitemOwner.find(itm => itm.id === show_item.user_id)
            setItemOwner(infO)
            console.log("shown oner", infO , item_owner)
        },[allitemOwner , show_item])




    const accept_handler = async(item_selected , is_refresh)=>{
        setIsloading(true)

        console.log("acceptv" ,item_selected)
        const   rqstr_prod = {name:item_selected.name  ,id:item_selected.id,img:item_selected.img1, brand:item_selected.brand ,size: item_selected.size, category: item_selected.category}
        const owner_prod={name :prop.owner_prod.name,id :prop.owner_prod.id,img:prop.owner_prod.img1 ,brand:prop.owner_prod.brand ,size:prop.owner_prod.size, category:prop.owner_prod.category }
        console.log(owner_prod , rqstr_prod)
        const declined_id = selected_items.filter(itm => itm.swrq_id !== show_item.swrq_id).map(itm => itm.swrq_id);
        console.log("shit of time",declined_id ,show_item.swrq_id )
           try {
                       console.log("iam here")
                       const res = await fetch("http://localhost:8000/protectedApi/acceptreq", {
                           method:"POST",
                           credentials: "include",
                           headers :{
                        "Content-Type" : "application/json"
                      },
                           body : JSON.stringify({accepted_id : show_item.swrq_id,rqstr_id :show_item.user_id ,declined_id : declined_id  , owner_prod : owner_prod , rqstr_prod : rqstr_prod})
                       });
                       console.log(res)
               
                       if (res.ok) {
                           const data = await res.json();
                           console.log(data ,selected_items ,item_selected )
                           navi('/Final')
                         setIsloading(false)

                    
                           return 
                       }
               
                       if (res.status === 401 && is_refresh) {
                           const refreshed = await refrsh_jwt_token();
               
                           if (refreshed.success) {
                               console.log("hi token rfreshed ")
                                accept_handler(item_selected,false);
                           }
                       }
               
                       throw new Error(`Request failed: ${res.status}`);
                      
                   }
                   
                catch(error){
                    console.log(error)
                  alert("eroor while accepting")
                }
    }
        

        
    



    const  decline_handler = async(item_selected , is_refresh)=>{
        console.log("parametr :",sltd_length ,show_item.swrq_id)
        setIsloading(true)


    
          try {
                       console.log("iam here")
                       const res = await fetch("http://localhost:8000/protectedApi/swap_request", {
                           method:"DELETE",
                           credentials: "include",
                           headers :{
                        "Content-Type" : "application/json"
                      },
                           body : JSON.stringify({swap_id : show_item.swrq_id , num_rq : sltd_length  })
                       });
                       console.log(res)
               
                       if (res.ok) {
                           const data = await res.json();
                           console.log(data ,selected_items ,item_selected )
                           const slans = selected_items.filter(item => item.id !== item_selected.id)
                              
                            prop.setReqres_item(prev =>
                                prev.map(itm =>itm.id === prop.swap_id ? {...itm , data :slans} :itm)
                            )
                            console.log("slance",slans)
                            setSelected_items(slans || [])
                            if(slans.length === 0){
                                 navi('/')
                            }
                            show_nxt()
                            setIsloading(false)

                           
                           return 
                       }
               
                       if (res.status === 401 && is_refresh) {
                           const refreshed = await refrsh_jwt_token();
               
                           if (refreshed.success) {
                               console.log("hi token rfreshed ")
                               return decline_handler(item_selected,false);
                           }
                       }
               
                       throw new Error(`Request failed: ${res.status}`);
                      
                   }
                   
                catch(error){
                    console.log(error)
                  alert("eroor while deleting")
                }
    }
    
    if(isloading){
        <Loading></Loading>
    }else{
    return(
        <>
        <style>{`
        .r_r_parent{
            width :100%;
            background-color: #f9f9f8ad;
            border: 1px solid black;
            padding: 10px;
        }
        .button_contnr{
            width :100%;
            margin :10px;
            height :50px; 
            display: flex;
            flex-direction: row;
            justify-content: space-around;
            align-items: center;

        }
        .button_contnr button{
            width:20%;
            height:50px;
            border: 1px solid black;
            border-radius : 10px;
            box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.477);

        }
        .button_contnr button:active{
            background-color:   #eee2d3;
            box-shadow: 1px 1px 5px transparent;
            transform: scale(0.95);
            border-color: transparent;
            transition: all 0.41s ease;
    
        }

        `}
    
        </style>


        <div className="r_r_parent">
            <div className="button_contnr">
                <button onClick={()=>prop.setIsreq_reply(false)}>{"back->"}</button>
           {sltd_length>1 &&<button onClick={()=>show_req1()}>Request 1</button>}
            {sltd_length>1 &&<button onClick={()=>show_req2()}>Request 2</button>}
            {sltd_length>2 &&<button onClick={()=>show_req3()}>Request 3</button>}
         
            </div>
                            <div className="share-page">
                                
                                 <div className="img_div_child">
                                                  
                                     <div className="img_div">
                                        
                                         <img className="getcloth-img" src={show_item.img1}></img>
                                         <div className="imgpannel">
                                             <img className="getcloth-img-small" src={show_item.img1}></img>
                                             <img className="getcloth-img-small" src={show_item.img2}></img>
                                             <img className="getcloth-img-small" src={show_item.img3}></img>
                         
                         
                                         </div>
                                     </div>
                                     
                                         <p className="info-text"><b>Material : </b>{show_item.material}</p>
                                         <p className="info-text"><b>Size : </b>{show_item.size}</p>
                                          <p className="info-text">
                                                 <b>Description : </b>{show_item.description || "Not provided"}
                                             </p>
                                 </div>
                                     <div className="cloth_info">
                                         
                                         <div className="inf-blaock">
                                             <h3>Cloth Information</h3>
                                             <p className="info-text"><b>Name : </b>{show_item.name}</p>
                                             <p className="info-text"><b>Category : </b>{show_item.category}</p>
                                             <p className="info-text"><b>Sub-category : </b>{show_item.sub_category}</p>
                                             <p className="info-text"><b>Brand : </b>{show_item.brand}</p>
                                             <p className="info-text"><b>Gender : </b>{show_item.gender}</p>
                                             <p className="info-text"><b>Color : </b>{show_item.color}</p>
                                             <p className="info-text"><b>Condition : </b>{show_item.condition}</p>
                                             <p className="info-text"><b>Worn : </b>{show_item.worn}</p>
                                             <p className="info-text"><b>Defects : </b>{show_item.defects}</p>
                                             <p className="info-text"><b>Swap-size : </b>{show_item.swap_size}</p>
                                             <p className="info-text">
                                                 <b>Estimated-value : </b>{show_item.estimated_value}
                                             </p>
                                             <p className="info-text">
                                                 <b>Location</b> :
                                                 <br />
                                                 country : {show_item.country}
                                                 <br />
                                                 state : {show_item.state}
                                                 <br />
                                                 pincode : {show_item.postal_code}
                                             </p>
                                              
                                            
                                     </div>
                                
                                         <div className="share-btn-div">
                                                
                                         <button className="trade_button" onClick={()=>accept_handler(show_item,true)}>Accept</button> 
                                   
                                         <button className="trade_button" onClick={()=>decline_handler(show_item , true)}>Decline</button>
                                         </div>
                                     </div>
                                 
                                 <div className="owner_info">
                                                     <span className="profile_img_span"><img className="profile_img_span" src={profile_img}></img></span><br></br>   
                                                                 <p className="info-text"><b>Name</b> : {item_owner?.name} </p>
                                                                 <p className="info-text"><b>Email</b>   : {item_owner?.email} </p>
                                                                 <p className="info-text"><b>Reputaion Score</b>   : {item_owner?.reputation_score} </p>
                                                                 <p className="info-text"><b>Total_swaps</b>   : {item_owner?.total_swaps} </p>
                                                                 <p className="info-text"><b>Location</b> : <br></br>country : {item_owner?.location?.country}<br></br>state : {item_owner?.location?.state}<br></br>pincode : {item_owner?.location?.pin}                                   
                                     </p> 
                                     </div>

                               </div>

             <div className="button_contnr">
            <button onClick={()=>show_nxt()}>Next</button>
            </div>

        </div>

        </>

)}
}




export default Reply_req;