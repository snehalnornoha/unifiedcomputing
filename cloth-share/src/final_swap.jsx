import { useState ,useEffect } from 'react';
import './final_swap.css'
import { refrsh_jwt_token } from './controlers';
import { Loading } from './Kart';
import { useNavigate } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL;

function Transctn(prop){
    const tr = prop.tr
    const navi = useNavigate()

    const [isCancel , setIsCancel] =useState(false)
    const [something , setSomething] = useState("")
    const [rating, setRating] = useState("")
    const [loc, setloc] = useState("")
    const [rateEror,  setRateEror] = useState(false)
    
    console.log("isdespute",tr.status, prop.isdisput)
    const [isloading , setIsloading] = useState(false)


    const completed =async(is_refresh)=>{
        setIsloading(true)
        console.log("hi",something)
        if(loc.trim() === "" ||something.trim() ==="" || rating < 0 || rating >10 ){return alert("pls enetr all field to submit")}
        console.log("completed" , something , rating ,loc)
        const ids = {owner_id :tr.owner_id, requester_id:tr.requester_id}
        const delids = [tr.owner_item.id ,tr.requester_item.id]
        console.log(delids)
        
        try{
            
                const res = await fetch(`${API_URL}/protectedApi/cmplt_transation`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        'Content-Type': 'application/json'
                    },  
                    body: JSON.stringify({
                        delids :delids,
                        trans_id : tr.id,
                        ids: ids,
                        rating:{rate :rating ,  reason: something },   
                        location: loc
                        
                    })
                });
                console.log(res)
                if(res.ok) {
                        const result = await res.json();
                        //setFriends(result.message);
                        
                        console.log(result)
                        console.log(typeof(result.data))
                        alert("Swap completed query is sent!");
                        navi('/')
                        setIsloading(false)

                        
                    }
                    
            
                else if(res.status === 401 && is_refresh) {
                    console.log("hi")
                        const refreshed = await refrsh_jwt_token();
            
                        if (refreshed.success) {
                            console.log("hi token rfreshed ")
                            return completed(false);
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

    const canceled = async(is_refresh)=>{
        setIsloading(true)
        console.log("hi",something)
        if(something.trim() ===""  ){return alert("pls enetr all field to submit")}
        console.log("completed" , something , rating ,loc)
        const ids = {owner_id :tr.owner_id, requester_id:tr.requester_id}
        const upids = [tr.owner_item.id ,tr.requester_id.id ]
        
        console.log(upids)
        
        try{
            
                const res = await fetch(`${API_URL}/protectedApi/cncl_transation`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        'Content-Type': 'application/json'
                    },  
                    body: JSON.stringify({
                        upids :upids,
                        trans_id : tr.id,
                        ids: ids,
                        reason: something 
                    
                    })
                });
                console.log(res)
                if(res.ok) {
                        const result = await res.json();
                        setIsloading(false)
                        alert("Swap canceled query is sent!");
                        navi('/')
                        
                        
                    }
                    
            
                else if(res.status === 401 && is_refresh) {
                    console.log("hi")
                        const refreshed = await refrsh_jwt_token();
            
                        if (refreshed.success) {
                            console.log("hi token rfreshed ")
                            canceled(false);
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


    const rate_valid =  (e) => {
        const value = Number(e.target.value);
        if (value >= 0 && value <= 10) {setRating(value);
            setRateEror(false)
        } else{setRateEror(true)}
    }

    if(isloading){
        <Loading></Loading>
    }else{
    return(
            <div id="transactionList">

                <div className="transaction-card">

                    <div className="transaction-header">
                        <h3>Transaction {prop.one+1}</h3>

                        <span className="status initiated">
                            {tr.status}
                        </span>
                    </div>

                    <div className="products">

                    <div className="product">
                            <img src={tr.owner_item.img} alt="Owner product" />

                            <p>Owner Product</p>
                            <p>Name: {tr.owner_item.name ||"ji"}</p>
                            <p>Size: {tr.owner_item.size}</p>
                            <p>Category: {tr.owner_item.category}</p>
                            <p>Brand: {tr.owner_item.brand}</p>
                        </div>

                        <div className="swap-arrow">
                            ⇄
                        </div>

                        <div className="product">
                            <img src={tr.requester_item.img} alt="Requester Product" />

                            <p>Requester Product</p>
                            
                            <p>Name: {tr.requester_item.name ||"hi"}</p>
                            <p>Size: {tr.requester_item.size}</p>
                            <p>Category: {tr.requester_item.category}</p>
                            <p>Brand: {tr.requester_item.brand}</p>
                        </div>

                    </div>
                    { !prop.isdisput && !prop.isdoneby &&
                        <>
                        <div className="transaction-info">
                            <label htmlFor="loc">Swap Loaction(place name or nearby_landmark or post name) :</label>
                            <input name="loc"  onChange={(e) => setloc(e.target.value)} /> 
                            <label htmlFor="rate">Rating :</label>
                            <input name="rate" value={rating} onChange={(e)=>rate_valid (e)} /> 
                                {rateEror && <p >pls rate with in 0 to 10</p> }
                            <label htmlFor="rsn">Reason:</label>
                            <textarea value={something} onChange={(e) => setSomething(e.target.value)} />
                        </div>
                            
                        <button onClick={()=>completed(true)} className="cmplt-btn">
                            Completed
                        </button>
                        </>
                    }{!prop.isdisput ?
                        <>
                            {!isCancel ?
                            <button className="cancel-btn" onClick={()=>setIsCancel(true)}>
                                Cancel Transaction
                            </button> :
                            <div className="cnl-rsn">
                            <label htmlFor="rsn">Reason:</label>
                                <textarea value={something} onChange={(e) => setSomething(e.target.value)} />
                                <button className="cancel-btn" onClick={()=>canceled(true)}>
                                
                                Cancel 
                            </button>
                            <button className="cancel-btn" onClick={()=>setIsCancel(false)}>back</button>
                        
                            </div>}
                     </>:!prop.isdoneby&&
                     <>
                            {!isCancel ?
                            <button className="cancel-btn" onClick={()=>setIsCancel(true)}>
                                Cancel Transaction
                            </button> :
                            <div className="cnl-rsn">
                            <label htmlFor="rsn">Reason:</label>
                                <textarea value={something} onChange={(e) => setSomething(e.target.value)} />
                                <button className="cancel-btn" onClick={()=>canceled(true)}>
                                
                                Cancel 
                            </button>
                            <button className="cancel-btn" onClick={()=>setIsCancel(false)}>back</button>
                        
                            </div>}
                     </>
                }

                </div>

            </div>
        )
    }
}


function Fianl_swap(prop){

const [trsn, setTrsn] =useState([])
const [iscnld , setIscnld] =useState(false)
const [rej ,setRej] = useState([])
const [ini ,setIni] = useState([])

useEffect( ()=> {
    console.log("jhi")
    const fetchdata = async(is_refresh)=>{
        try{
        
            const res = await fetch(`${API_URL}/protectedApi/transactions`, {
                method: "GET",
                credentials: "include"
            });
            console.log(res)
            if(res.ok) {
                    const result = await res.json();
                    //setFriends(result.message);
                    setTrsn([...result.data])
                    console.log(result)
                    console.log(typeof(result.data))
                }
                
        
            else if(res.status === 401 && is_refresh) {
                console.log("hi")
                    const refreshed = await refrsh_jwt_token();
        
                    if (refreshed.success) {
                        console.log("hi token rfreshed ")
                         fetchdata(false);
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

},[]);

useEffect(()=>{
    if(!trsn.length === 0){console.log("no paji");return}
    console.log("all trans",trsn)
    let intiated = []
    let rejected = []
    
                    
    for(const itm of trsn){
        console.log("hi",itm.status)
        if(itm.status ==='requester_disputed' ||itm.status === 'owner_disputed'){
           rejected.push(itm)
        }else{
        
         intiated.push(itm)
        }
    }
    console.log("initiated", ini, "rejected",rej)
    setRej(rejected)
    setIni(intiated)



},[trsn])



return(
    <div className="container">
 
        <div className="tabs">

     
            <div onClick={()=>setIscnld(false)}  className="tab" >
                ACTIVE TRANSACTION  {ini?.length||0}
            </div>
            <div onClick={()=>setIscnld(true)}  className="tab" >
                REJECTED TRANSACTION  {rej?.length||0}
            </div>

        </div>
        { iscnld ?
        rej?.map((tr, indx) =>{

                let isdoneby = false
                if(tr.status ==='requester_disputed' ){
                    isdoneby = prop.user_info.current.data.id  === tr.requester_id
                }else if(tr.status ==='owner_disputed' ){
                    isdoneby = prop.user_info.current.data.id  === tr.owner_id
                }
                console.log("---------->",isdoneby)
                return( <Transctn isdoneby={isdoneby} isdisput={true} key={indx} tr={tr} one={indx}/>)
                }) :
            ini?.map((tr, indx) =>{ 
                 let isdoneby = false
                if(tr.status ==='requester_completed'){
                    isdoneby = prop.user_info.current.data.id  === tr.requester_id
                }else if(tr.status ==="owner_completed" ){
                    isdoneby = prop.user_info.current.data.id  === tr.owner_id
                }
                console.log("---------->",isdoneby)
                return( <Transctn key={indx} isdisput={false}  isdoneby={isdoneby} tr={tr} one={indx}/>)
        })

        }
      
   

    </div>
)
}

export default Fianl_swap;