import "./share_page.css"; 
import profile_img from "./assets/react.svg";
import { useEffect, useRef } from "react";
import { useState } from "react";
import { refrsh_jwt_token ,send_liked} from "./controlers";
import { get_my_Listing } from './controlers.jsx';
import {Kart_card, Loading}  from './Kart.jsx'
import { FaRegHeart, FaHeart } from "react-icons/fa";
import {useNavigate} from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;



const display_option = async(itm_user,my_id,setMyList ,setIsdisplay_optn)=>{
    console.log("-------------------" ,itm_user,my_id)


    if(itm_user === my_id ){alert("its yours cloth pls select the others cloth");return}
    console.log("does")
    
    const get_items = async()=>{
    const ans = await get_my_Listing(true)
  
    console.log(ans)
    if(ans.success){   
        if(ans.data.length > 0){
            const data = ans.data
            return data
        }
        else{
            alert("please upload you request first !")
        }

    }
    }
    const data = await get_items()

    const lst = data.filter((itm)=>itm.status !=="inactive" )
    setMyList(lst)
    setIsdisplay_optn(true)

           

}



function SharePage(props) {
    const navi = useNavigate()
    console.log("user_info",props.user_info)
    const item =props.clicked_item
    const [item_owner ,setItemOwner] = useState("")
    const [myLists , setMyList] = useState([])
    const [isdisplay_optn , setIsdisplay_optn] = useState(false)
    const [isselect_optn , setIsselect_optn] = useState(false)
    const temp_MyList = useRef([]);
    const selected_item = useRef(null);
    const islike= useRef(false);
    const [isliked, setIsliked] = useState(false);
    const [is_already , setIs_already] = useState(false)
    const [isloading , setIsloading] = useState(false)

    console.log("share page inside true");


    async function share_transaction(body_value,is_refresh){

        console.log("transaction sendt")
    try{
        console.log("send" ,body_value )
        const res = await fetch(`${API_URL}/protectedApi/snd_trnsctn_rqst`,{
            method:"PUT",
            credentials : "include",
            headers:{
                "Content-Type":"application/json"
            },
            body : JSON.stringify(body_value)
        });
        if(res.ok){
            const data = await res.json()
            props.all_users_requests.current.check  = true
            console.log("idk why iam still here " , props.all_users_requests.current)
            return {success : true}

          

        
            
        }
        else if(res.status === 401 && is_refresh)
        {
            const refeshed = refrsh_jwt_token()
            if(refeshed.success){
                share_transaction(body_value,false)}
            else{
                throw new Error("error idk")
            }
        }
        else{
            throw new Error("error idk")
        }



    }
    catch(error){
        console.log(error)
        alert("Error :  Please  try again")
        return{success : false}

    }



}

    // Select one item from my list
    const select_item = (itm) => {
        console.log("selected-item " , itm )

        // Save the original list before replacing it
        temp_MyList.current = [...myLists];

        // Store which item was selected
        selected_item.current = itm;

        console.log("++++ temp_MyList:", temp_MyList.current);
        console.log("++++ selected_item:", selected_item.current);

        // Show only selected item
        setMyList([itm]);

        // Toggle selection mode
        setIsselect_optn(true);

        console.log(
            "===> myLists:",
            myLists,
            "===> temp_MyList:",
            temp_MyList.current
        );
    };

    useEffect(() => {
    console.log("myListSearch changed:", props.clicked_item);
    console.log("myListSearch changed:", props.user_info?.current);
    console.log("mlh rreq:", props.all_users_requests);
    console.log("myListSearch changed:",props.wishList);
    console.log("item owner",item_owner);
    
}, [myLists , item_owner]);


    // Unselect the item
    const un_select_item = () => {

        if (!isselect_optn) {
            return alert("first select to un_select 😊");
        }

        // Restore the original list
        setMyList([...temp_MyList.current]);

        console.log("myList:", myLists);

        // Clear refs
        temp_MyList.current = [];
        selected_item.current = null;

        // Exit selection mode
        setIsselect_optn(false);

        console.log(
            "===> myLists:",
            myLists,
            "===> temp_MyList:",
            temp_MyList.current
        );
    };


    // Share selected item
    const handleShare = async() => {

        // Must have exactly one item
        if (myLists.length !== 1) {
            return alert("multiple selection is not allowed");
        }

        const selectedMyItem = myLists[0];

        const body_data = {
            owner_id: item.user_id,
            owner_item_id: item.id,
            replacer_item_id: selectedMyItem.id
        };

        console.log("Share body:", body_data);
        setIsloading(true)

        const ans = await share_transaction(body_data, true);
        if(ans.success){
           
            props.setIsharepage(false) 
            navi('/myList')
             setIsloading(false)
        }
        else{
            alert("pls try again")
        }
    };
    const  handle_delete = ()=>{
        navi("/myList")

    }

     useEffect(()=>{
        console.log("what i wish:",props.wishList.current)
        
        const wishList_checker = props.wishList.current.data.some(wish => wish.id === item.id)
        console.log(wishList_checker)
        const load_owner =async (is_refresh)=>{ 
            try{
            const res = await fetch(`${API_URL}/protectedApi/get_owner_info`, {
                method: "POST",
                credentials: "include",
                headers:{
                    "Content-Type": "application/json"
                },
                body:JSON.stringify({owner_id : item.user_id })


                })
                if(res.ok){
                    const data = await res.json();
                    setItemOwner(data.owner[0])
                    
                    console.log("---00--->",data)
                    console.log("hiiii",props.wishList.current ,wishList_checker)
                    if (wishList_checker) {
                        setIsliked(true)
                        isliked.current = true
                    }
                  
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
            console.log("all req",props.wishList.current)
            props.wishList.current.data.forEach(element => {
                console.log(item.id ,element.id )
                
            }); 
            if(props.all_users_requests.current.data?.some(req => req.id === item.id)){
                setIs_already(true)
                console.log("hi he is matched")
            }




        }
        load_owner(true)

        return() =>{
          
            console.log(islike.current)
            if(!islike.current || wishList_checker){
                console.log("not refreshed")
                return}
             console.log("refeshed")
            const send_req_like = async()=>{
            console.log("sending liked")
            await send_liked(item?.id,true)
            }
            
            send_req_like()
            

        }


     },[])


     if(isloading){
            return(<Loading></Loading>)
     }else{
     return (
    
      <div className="share-page">
       
        <div className="img_div_child">
             
            <div className="img_div">
                <button onClick={()=>{setIsliked(!isliked);islike.current = !islike.current} }>{isliked?"❤":"♡"}</button>
                <img className="getcloth-img" src={item.img1}></img>
                <div className="imgpannel">
                    <img className="getcloth-img-small" src={item.img1}></img>
                    <img className="getcloth-img-small" src={item.img2}></img>
                    <img className="getcloth-img-small" src={item.img3}></img>


                </div>
            </div>
            
                <p className="info-text"><b>Material : </b>{item.material}</p>
                <p className="info-text"><b>Size : </b>{item.size}</p>
                 <p className="info-text">
                        <b>Description : </b>{item.description || "Not provided"}
                    </p>
        </div>
            <div className="cloth_info">
                
                <div className="inf-blaock">
                    <h3>Cloth Information</h3>
                    <p className="info-text"><b>Name : </b>{item.name}</p>
                    <p className="info-text"><b>Category : </b>{item.category}</p>
                    <p className="info-text"><b>Sub-category : </b>{item.sub_category}</p>
                    <p className="info-text"><b>Brand : </b>{item.brand}</p>
                    <p className="info-text"><b>Gender : </b>{item.gender}</p>
                    <p className="info-text"><b>Color : </b>{item.color}</p>
                    <p className="info-text"><b>Condition : </b>{item.condition}</p>
                    <p className="info-text"><b>Worn : </b>{item.worn}</p>
                    <p className="info-text"><b>Defects : </b>{item.defects}</p>
                    <p className="info-text"><b>Swap-size : </b>{item.swap_size}</p>
                    <p className="info-text">
                        <b>Estimated-value : </b>{item.estimated_value}
                    </p>
                    <p className="info-text">
                        <b>Location</b> :
                        <br />
                        country : {item.country}
                        <br />
                        state : {item.state}
                        <br />
                        pincode : {item.postal_code}
                    </p>
                     
                   
            </div>
            {isdisplay_optn &&
                
                 <div className="option-container">
                                        <h2 >choose any one</h2>
                                        <p>you can undo to re-select</p>
                                    <div className="option-kart">
                                        {
                                           myLists.map((itm,index)=>{
                                                            console.log("map-->" ,itm)
                                                            return <Kart_card  key={index} kart_status ={item.swrq_status} list_item = {itm} bt1_text ={"select"} bt2_text ={"undo"}
                                                                                                       bt1_act = {()=>{select_item(itm)}} bt2_act = {()=>{un_select_item(itm)}} />
                                                        })
                                                    }
                                    </div>
                                    </div>
            }

                <div className="share-btn-div">
                { !isdisplay_optn && !is_already &&               
                <button className="trade_button" onClick={()=>display_option(item.user_id,props.user_info.current.data.id ,setMyList ,setIsdisplay_optn)}>Share</button> 
            }
               {isselect_optn && <button className="trade_button" onClick={()=>{handleShare()}}>swap</button>}
               {is_already && <button className="trade_button" onClick={()=>handle_delete()}>Undo share</button>}
                <button className="trade_button" onClick={()=>{props.setIsharepage(false);setIsdisplay_optn(!isdisplay_optn) }}>Exit</button>
                </div>
            </div>
        
        <div className="owner_info">
                            <span className="profile_img_span"><img className="profile_img_span" src={item_owner?.profile_image_url||profile_img}></img></span><br></br>   
                                        <p className="info-text"><b>Name</b> : {item_owner?.name} </p>
                                        <p className="info-text"><b>Email</b>   : {item_owner?.email} </p>
                                        <p className="info-text"><b>Reputaion Score</b>   : {item_owner?.reputation_score} </p>
                                        <p className="info-text"><b>Total_swaps</b>   : {item_owner?.total_swaps} </p>
                                        <p className="info-text"><b>Location</b> : <br></br>country : {item_owner?.location?.country}<br></br>state : {item_owner?.location?.state}<br></br>pincode : {item_owner?.location?.pin}                                   
            </p> 
            </div>
      </div>
     )
    }


 
    };
export default SharePage;
 