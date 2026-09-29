import "./home_page.css";
import profile_img from "./assets/react.svg";
import profile_img2 from "./assets/image2.png";
import { useEffect, useRef , useState} from "react";
import SharePage from "./share_page";
import {refrsh_jwt_token ,get_my_Request} from './controlers.jsx'
import Edit_profile from "./Edit_profile.jsx";






function Item_card({setIsharepage, ...props}){
    const item_image =props.item.img1 ||props.item.img2 ||props.item.img3 
    const item_clcik_handler = () =>{
        props.setClicked_item(props.item)
        setIsharepage(true)
    }
    return(
        
        <div   onClick={()=>item_clcik_handler()} className="item_card"> 
     
        <img className="item_img" src={item_image}></img>
       <p  className="item_name">{props.item.brand}{"\u00A0"}{props.item.category}</p>
        <span className="i_info_container">
            <p className="i_info">Size :</p><p className="i_info">{props.item.size}</p></span>
        <span className="i_info_container">
            <p className="i_info">Condition : </p><p className="i_info">{props.item.condition}</p></span>
        <p className="item_price">{props.item.estimated_value}</p>

        </div>
    )
 }








function Start_page(prop){
    
    const [isharepage , setIsharepage] = useState(false);
    const [clicked_item , setClicked_item] = useState("")
    const [pagerefesh , setPagerefresh] = useState(true)
    const [in_c_profile , setIn_c_profile] = useState(prop.is_edit_propfile)
    const [item_List  , setItem_List]= useState([{
        img1: "",
        name: "Floral Summer Dress",
        category: "Dress",
        brand: "H&M",
        size: "S",
        condition: "no data",
        price: 800
      }]);





    useEffect(()=>{
        if(!prop.islogedin){return };
        console.log("jnkjzkjn-->",prop.all_users_requests.current)
        const load_all_request =async()=>{
             console.log("jnkjzkjn-->",prop.all_users_requests.current)
            if(prop.all_users_requests.current.check){
                const ans = await get_my_Request(true)
                prop.all_users_requests.current.data = ans.data
                prop.all_users_requests.current.check = false

            }
        }
            load_all_request()
            console.log("jnkjzkjn-->",prop.all_users_requests.current)

        
    },[])

    useEffect(()=>{
        console.log("ima in get userinfo",prop.user_info.current.check)
        if(!prop.user_info.current.check || !prop.islogedin){console.log("no user_info check") ;return}
        const get_user_info = async(one_time_refresh)=>{
            console.log("--###-->",!prop.islogedin)
           
            
            
        try {
            const res = await fetch("http://localhost:8000/protectedApi/get_user_info", {
                method: "GET",
                credentials: "include",
            });

            if(res.ok){
                
                const data = await res.json();
                console.log(data);

              
                prop.user_info.current.data = data.user[0]
                prop.user_info.current.check = false
                console.log("\\\\\\\\\\",data);
                if(prop.wishList.current.check ){
                    prop.wishList.current.data = data.wishList.data
                    prop.wishList.current.check = false
                }
                const loc = data.user[0].location
                console.log("loccccccccc",data.user[0].location)
                if(!loc.state || !loc.pin || !loc.country ){
                    console.log("hey aagggggggggggggggggggggg")
                    setIn_c_profile(false);
                }
            }

            else if(res.status === 401 && one_time_refresh){
                 const refreshed = await refrsh_jwt_token()
                            if (refreshed.success) {
                                 get_user_info(false);
                            }
                        
              
            }

            else{
                throw new Error("access denied pls try again");
            }

        } catch(error) {
            console.error("Error:", error);
        }



           
           
        }
        
         get_user_info(true)
         console.log("hih")
        

    },[pagerefesh])


    useEffect(()=> {
        let Searching_factor = { isloged : false}
        console.log("SF",prop.searching_factor)
        console.log(prop.user_info.current.data?.id)
        if(prop.need_refresh.current.search){
            
            Searching_factor = prop.searching_factor
            console.log("hi hoh ho==> " ,Searching_factor)
            prop.need_refresh.current.search = false
        }
        else if(prop.need_refresh.current.check){
                console.log("iam represhing")
            Searching_factor = prop.islogedin? {location :prop.user_info.current.data?.location , isloged : true}:
                                                { isloged : false};
            prop.need_refresh.current.check = false
            
        }
        
        else{
                console.log("not-refreshing") ; 
                setItem_List(prop.need_refresh.current.data)
                return

       
        }
        const load = async()=>{
        try {

          const response = await fetch(`http://localhost:8000/api/load_clothes`,
            {
              method:"POST",
              headers: {
                    "Content-Type": "application/json"
                    },
              body : JSON.stringify(Searching_factor),
            credentials : "include",

            })
            if(response.ok){
              const data = await response.json()
              console.log("data from load_clothes",data)
              
              setItem_List(prev => {
                const combined = [...data, ...prev];

                const unique= combined.filter(
                    (item, index, arr) =>
                    index === arr.findIndex(x => x.id === item.id)
                );
                prop.need_refresh.current.data = unique
                return unique;
                });
                
              console.log("->>>>>>>>>")

              
            }
            else{
              throw new Error("please try again")
            }
          }
          catch(error){
            console.log(error)

          }
        }
        load()
        console.log("hi")
          

       
    },[prop.searching_factor])



   //---------------RETURN BLOCK -----------------
    if(isharepage){
        console.log("share page is true")
        return(  
            <SharePage setIsharepage={setIsharepage} clicked_item = {clicked_item} wishList={prop.wishList} all_users_requests = {prop.all_users_requests} user_info={prop.user_info} ></SharePage>           
        )
    }
    else if(!in_c_profile){
        console.log("share page is true")
        return(  
            <Edit_profile setIn_c_profile ={setIn_c_profile} user_info = {prop.user_info} setPagerefresh = {setPagerefresh} pagerefresh = {pagerefesh }/>          
        )

    }
    else{   
    return(

        <div className="home-parent">
           
           
                <div className="home-itms">
                    {
                        item_List.map((item, index)=>{
                           
                            return(
                                <Item_card setIsharepage={setIsharepage} key={index} item = {item} setClicked_item ={setClicked_item}>
                                </Item_card>
                            )
                        })
                    }
                  
                </div>
              
               
            </div>


     

    )
}
}

export default Start_page;


