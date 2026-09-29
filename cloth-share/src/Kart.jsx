import { useEffect, useState ,useRef } from 'react';
import './Kart.css'
import def_imag from './assets/def_img.png'
const API_URL = import.meta.env.VITE_API_URL;



export function Kart_card(prop){
    const given_item = prop.list_item;
 

    console.log(prop.list_item)
    const img = given_item?.img1 || given_item?.img2 || given_item?.img3 || def_imag
    const brand =given_item?.brand || "No Brand name"
    const date = given_item?.created_at?.split("T")[0] || "00-00-00"
    const condition =given_item?.condition || "not mentioned"
    const kart_status = prop.kart_status || "status"
    return(

        <div className="kart-card">
            <span className="kart_status">
                        {kart_status}
                    </span>
             
            
            <img  src={img} alt="" className="kart-img"  onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = def_imag;
                            }}/>
            
                <div className="kart-detail">
                    <p className="head-of-kart">
                      Brand:{brand}
                    </p>
                    <p className="desc-kart"> date:{date}</p>
                    <p className='desc-kart' >size:{given_item?.size || "00"}, condition :{condition} ,category: {given_item?.category || "😕"},</p>

                </div>
                <div className="kart-button">
                    <button className='kart-btn'  onClick={()=>prop.bt1_act() }>{prop.bt1_text }</button>
                    <button className='kart-btn'  onClick={()=>prop.bt2_act() }>{prop.bt2_text  }</button>
                    
                </div>

           

        </div>
    )
}


//histKart
export function Hist_card(prop) {

    const given_item = prop.list_item || {};

    // JSONB snapshots
    const owner_item = given_item.owner_item || {};
    const requester_item = given_item.requester_item || {};

    // Images stored separately in swap_transactions
    const owner_img = given_item.owner_prod_img || def_imag;
    const requester_img = given_item.requester_prod_img || def_imag;

    // Transaction information
    const status = given_item.status || "initiated";

    const created_date =
        given_item.created_at?.split("T")[0] || "00-00-00";

    const scheduled_date =
        given_item.scheduled_date?.split("T")[0] || "Not scheduled";

    const completed_date =
        given_item.completed_at?.split("T")[0] || "Not completed";


    return (
        <div className="hist_kart-card">

            {/* REQUESTER IMAGE */}
            <img
                src={requester_img}
                alt="Requester product"
                className="kart-img" 
                onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = def_imag;
                }}
            />


            {/* REQUESTER ITEM */}
            <div className="kart-detail">

                <p className="head-of-kart">
                    REQUESTER 
                </p>

                <p className="desc-kart">
                    item:{requester_item.name || "No Product"}
                    name:{requester_item.username}
                    Brand: {requester_item.brand || "No Brand"}
                    Size: {requester_item.size || "N/A"}
                    Category: {requester_item.category || "N/A"}
                </p>

            

            </div>


         

           <div className="kart-detail">

                <p className="head-of-kart">
                    OWNER 
                </p>

                <p className="desc-kart">
                    item :{owner_item.name || "No Product"}
                    name:{owner_item.username}
                    Brand: {owner_item.brand || "No Brand"}
                    Size: {owner_item.size || "N/A"}
                    Category: {owner_item.category || "N/A"}
                </p>

            

            </div>



            {/* OWNER IMAGE */}
            <img
                src={owner_img}
                alt="Owner product"
                className="kart-img" 
                onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = def_imag;
                }}
            />

        </div>
    );
}


export function Loading(){

    return(
        <div className="loader_div">
        <span className="loader"></span>
        Loading ....
        </div>
    )
    
}

