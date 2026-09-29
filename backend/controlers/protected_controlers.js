
import {uploadToCloudinary,deleteFromCloudinary  }from './image_handle.js'
import { cloth_upload ,get_user_info_db,update_user_info_db,del_ifuk_swap_request,accpt_swap_request,get_friend_db ,get_transctn_db,cmplt_transctn_db ,
    cncl_transctn_db,get_allchat_db,get_allnoti_db ,insert_noti,
    noti_seen_db ,chat_seen_db,update_profile_photot} from './databse.js'
import {  get_myListing_db ,get_myRequets_db ,update_Requets_db,
     update_side_db ,get__myhist_db,get__myWish_db} from './database2.js';
import {add_to_wishlist,del_to_wishlist ,del_to_swap_request , del_to_clothing ,get_all_reqres_db}  from './database2.js'
import { json } from 'express';

import { getIO, getUsers } from "../socket.js";


export const send_notifiaction = async(From_id,to_id,type , msg)=>{
    console.log("ima in noti")
    console.log(From_id ,to_id ,type,msg )
    const ans = await insert_noti(From_id ,to_id ,type,msg )
    console.log(ans)
        try{
        const io = getIO();
        const users = getUsers();

            const socketId = users.get(to_id);
            console.log("id",socketId)

        if (socketId) {
            io.to(socketId).emit("notification", {
                type: type,
                msg: msg
            });
        }
    }
    catch(error){
        console.log(error)

    }
    
}


export const  cloth_share_upload = async (req , res , next)=>{
    console.log(req.files ,req.body)
    const images = req.files
    const f_data = req.body

    const user_id = req.user_id
    try{

        if(!images ||! f_data ) return res.json("something went wrong please check the image ");
         const image_URLs =  await Promise.all(images.map((image)=>{
            return uploadToCloudinary(image.buffer)
        }))
        console.log("hey upload complted ", image_URLs)

        if(image_URLs){

        const f_data = req.body;

        const values = [
            req.user_id,
            f_data.name,f_data.category,f_data.subCategory,
            f_data.brand,f_data.size,f_data.gender,f_data.color,
            f_data.material,f_data.condition,
            f_data.worn,f_data.defects,f_data.description,
            f_data.swapSize,f_data.estimatedValue,
            image_URLs[0],image_URLs[1],image_URLs[2]
        ];

            console.log("----> dabase values",values);
            const dbans = await cloth_upload(values ,user_id)
            console.log(dbans)
            if(dbans.success){
                res.json({success:dbans.success})
                console.log("iam in succes-if ")

            }
            else{
                const error = new Error(dbans.error)
                error.status= 500
                next(error)
            }

        }
    }
    catch(err){
        console.log(err)
        const  eror =  new Error("internal server error");
        eror.status =  500
        next(eror)
    }
}

export const handle_updtprofimg  = async (req , res , next)=>{
    console.log(req.files,req.body.imgurl)
    const images = req.files
    const user_id = req.user_id
    const oldImageUrl = req.body.imgurl;
    try{

        if(!images) return res.json("something went wrong please check the image ");
         const image_URLs =  await  uploadToCloudinary(images[0].buffer)
        console.log("hey upload complted ", image_URLs)

        if(image_URLs){
            const ans = await update_profile_photot(user_id , image_URLs)
            if(ans.success){
                deleteFromCloudinary(oldImageUrl)
                res.json({imgurl: image_URLs})
            }
            else{
                throw new Error("image upload error")
            }

        }
    }catch(err){
        console.log(err)
        const  eror =  new Error("internal server error");
        eror.status =  500
        next(eror)
    }
}

export const handle_get_user_info = async(req, res , next)=>{
    const userid = req.user_id
    const ans = await get_user_info_db([userid])
    console.log("iam in getuser_info" , ans)
    if(ans.success){
        const ans2 =await get__myWish_db(userid)
        console.log("iam in getuser_info" , ans)
        if(ans2.success){
            console.log("success" , ans2)
            return res.json({user : ans.info , wishList : ans2 })
        }
        res.json({user : ans.info , wishList :[] })
        
    }
    else{
        const err = new Error("Error in login:please login again")
        err.status = 501
        next(err)
    }


}
export const handle_get_owner_info = async(req, res , next)=>{
   
    const userid = req.body.owner_id 
    const ans = await get_user_info_db([userid])
    console.log("iam in getuser_info",ans)
    if(ans.success){
        res.json({owner : ans.info })
    }
    else{
        const err = new Error("Error in login:please login again")
        err.status = 501
        next(err)
    }


}
export const handle_edit_profile = async(req, res , next)=>{
    const userid = req.user_id
    const user_info = req.body
    console.log("iam in getupadte_info" , userid , user_info)
  
    const ans = await update_user_info_db(userid , user_info)
    
    if(ans.success){
        res.json(ans)
    }
    else{
        const err = new Error("Error in login:please login again")
        err.status = 501
        next(err)
    }


}

//searcting and retriving
export const send__myListing = async(req , res , next )=>{
    const user_id = req.user_id 
    console.log("hi iam here in myListing" , user_id)
    const ans = await get_myListing_db(user_id)
    console.log(ans)
    if(ans.success){
        console.log("dent data")
        res.json(ans)
    
    }
    else{
        const er = new Error("something went wrong")
        er.status = 501
        next(er)
    }


}
export const send__myRequest = async(req , res , next )=>{
    const user_id = req.user_id 
    console.log("hi iam here in myListing" , user_id)
    
    const ans = await get_myRequets_db(user_id )
    console.log(ans)
    if(ans.success){
        res.json(ans)
    }
    else{
        const er = new Error("something went wrong")
        er.status = 501
        next(er)
    }


}

export const send__myKart= async(req , res , next )=>{
    const user_id = req.user_id 
    const  iswish =  req.body.iswish
    const ishist = req.body.ishist
    let hist ={success : false} 
    let wish = {success : false} 
    console.log(req.body)
    console.log("hi iam here in send__myKart" , user_id)
    try{
    if(ishist){
        const ans = await get__myhist_db(user_id)
         console.log(ans)
        if(ans.success){
             hist = ans
        }
         else{
            throw new Error("serever error")
        }
    }
    if(iswish){
        const ans2 = await get__myWish_db(user_id)
         console.log(ans2)
         if(ans2.success){
             wish  = ans2
        }
        else{
            throw new Error("serever error")
        }

    }
     return res.status(200).json({
            success: true,
            hist: hist,
            wish: wish
        });
    
    }
    catch(error){
        console.log(error)
        next(error)

    } 
  
    

}




export const handle_trns_req = async(req , res , next )=>{
    const user_id = req.user_id 
    const user_prod_id = req.body.replacer_item_id
    const owner_id = req.body.owner_id
    const owner_prod_id = req.body.owner_item_id
    if(user_id === owner_id){
        const er = new Error("something went wrong pls first delete you request and retry")
        next(er)
    }
    const user_data = [user_id ,owner_id ,owner_prod_id ,user_prod_id]
   
    console.log("hi iam here in trans request" , user_id)
    
    const ans = await update_Requets_db(user_data)
    console.log(ans)
    if(ans.success){
       const ans2 = await update_side_db(user_prod_id , owner_prod_id)
       if(ans2.success){
        const msg = `${ans2.name} sent swap request with ${ans2.category}`
        send_notifiaction(user_id,owner_id,"Swap Request" , msg)
        return res.json({msg : "Go to bla bla in menu"})
       }
    }
    
    const er = new Error("something went wrong pls first delete you request and retry")
    next(er)
}


export const upadte_like= async(req ,res, next)=>{
    const user_id = req.user_id
    const prod_id = req.body.prod_id
    console.log(req.body)
    console.log("ima in upadte like ",user_id,prod_id)
    const ans = await add_to_wishlist(user_id ,prod_id)
    return res,json({ans});
    
}



export const del_wishList= async(req ,res, next)=>{
    console.log("#iam in del", req.body)
    const user_id = req.user_id
    const prod_id = req.body.prod_id
    console.log(req.body)
    console.log("ima in del like ",user_id,prod_id)
    const ans = await del_to_wishlist(user_id ,prod_id)
     if(ans.success){
        return res.json({ ans });

    }
    const er = new Error(ans.error)
    next(er)
    
}
export const del_clothing = async (req, res, next) => {
    console.log("iam in del", req.body)
    const user_id = req.user_id;
    const prod_id = req.body.prod_id;
    const produrl = req.body.produrl
    for(const purl of produrl ){
       await deleteFromCloudinary(purl)
    }
    console.log("---->",user_id , prod_id)
    const ans = await del_to_clothing(user_id, prod_id);
    if(ans.success){
        return res.json({ ans });

    }
    const er = new Error(ans.error)
    next(er)
};


export const del_swapRequest = async (req, res, next) => {
    const user_id = req.user_id 
    console.log("//iam in del", req.body)
    const swap_id= req.body.swap_id;
    const num_req = req.body.num_rq 
    let ans = ""
    const msg = num_req === undefined ?`The requester canceled his swap request` :`The requested cloth owner canceled your swap request`;

    console.log(num_req ,msg)
    
    if (num_req !== undefined){
        console.log("in del if you know ")
        ans = await del_ifuk_swap_request(swap_id, num_req);
    }else{
        console.log("in del if you dont know ")
         ans = await del_to_swap_request(swap_id);}
        console.log(ans)
     if(ans.success){
        send_notifiaction(user_id, ans.owner_id,"Swap Request" , msg)
        return res.json({ ans });

    }
    const er = new Error(ans.error)
    next(er)
};

export const all_resreqs = async(req, res, next)=>{
  const user_id = req.user_id 
    console.log("hi iam here in myListing" , user_id)
    
    const ans = await get_all_reqres_db(user_id)
    console.log(ans)
    if(ans.success){
        res.json(ans)
    }
    else{
        const er = new Error("something went wrong")
        er.status = 501
        next(er)
    }


}

export const get_multi_owner = async(req, res , next)=>{
   
    const userid = req.body.owner_id
    console.log("ima in get_multi")
    const ans = await get_user_info_db(userid)
    console.log("iam in getuser_info",ans)
    if(ans.success){
        res.json({owner : ans.info })
    }
    else{
        const err = new Error("Error in login:please login again")
        err.status = 501
        next(err)
    }


}
export const get_friends = async(req, res , next)=>{
    console.log("ima in get_multi",req.user_id)
   

    const user_id = req.user_id 
    
    const ans = await get_friend_db(user_id)
    console.log("iam in getuser_info",ans)
    if(ans.success){
        res.json({data: ans.info })
    }
    else{
        const err = new Error("Error in login:please login again")
        err.status = 501
        next(err)
    }

}
export const get_transactions = async(req, res , next)=>{
    console.log("ima in get_transi",req.user_id)
   

    const user_id = req.user_id 
    
    const ans = await get_transctn_db(user_id)
    console.log("iam in trans_info",ans)
    if(ans.success){
        res.json({data: ans.info })
    }
    else{
        const err = new Error("Error in login:please login again")
        err.status = 501
        next(err)
    }

}
export const get_all_chats  = async(req, res , next)=>{
    console.log("ima in get_allcht",req.user_id)

   

    const user_id = req.user_id 
    
    const ans = await get_allchat_db(user_id)
    console.log("iam in chat_info",ans)
    if(ans.success){

        res.json({data: ans.info , uid : user_id})
    }
    else{
        const err = new Error("Error in login:please login again")
        err.status = 501
        next(err)
    }

}
export const get_all_noti = async(req, res , next)=>{
    console.log("ima in get_allcht",req.user_id)
    const user_id = req.user_id 
    
    const ans = await get_allnoti_db(user_id)
    console.log("iam in chat_info",ans)
    if(ans.success){
        res.json({data: ans.info })
    }
    else{
        const err = new Error("Error in login:please login again")
        err.status = 501
        next(err)
    }

}


export const hanlde_accept_req = async(req, res , next)=>{
    console.log("ima in get_multi",req.body)
    const userid = req.user_id 
    const accpt_id = req.body.accepted_id 
    const decline_id = req.body.declined_id
    const owner_prod = req.body.owner_prod 
    const  rqstr_prod = req.body.rqstr_prod
    const rqstr_id = req.body.rqstr_id 
    
    const ans = await accpt_swap_request(userid,accpt_id,rqstr_id ,decline_id ,owner_prod ,rqstr_prod)
    const requester_iDs =ans.requester_id
    
    const  msg = `${owner_prod.name} has accepted your request`
    const  msg2= `${owner_prod.name} has accepted others product request`
    if(ans.success){
        send_notifiaction(userid,rqstr_id,"Swap Transaction" , msg)
        if(requester_iDs.length >0){
            console.log(requester_iDs)
        requester_iDs?.map(id => send_notifiaction(userid,id,"Swap Request" , msg2))
        }
        
        res.json({owner : ans.info })
    }
    else{
        const err = new Error("Error while accept:please check by going to tranasction page from menue")
        err.status = 501
        next(err)
    }


}



export const handle_cmplt_trnctn = async(req, res , next)=>{
    console.log("ima in get_transi",req.user_id)
    console.log(req.body)
    const user_id = req.user_id 
    const ids = req.body.ids
     const rating = req.body.rating
      const location = req.body.location 
      const trans_id  = req.body.trans_id 
      const delids = req.body.delids
   
    let who = ""

    if(user_id ===ids.owner_id){
        who = "owner"
    }
    else if(user_id ===ids.requester_id){
        who = "requester"
    }
    else{
        next(new Error("something is wrong with the ids pls try again"))
    }

  
    const updt_ids = Object.values(ids)
    const ans = await cmplt_transctn_db(updt_ids,delids,trans_id , who ,rating , location )
    console.log("iam in trans_info",ans)
    if(ans.success){
        const iMgurls =ans.imgsurl
        for(const durl  of iMgurls ){
            deleteFromCloudinary(durl)
        }
        res.json({data: ans.info })

    }
    else{
        const err = new Error("Error in login:please login again")
        err.status = 501
        next(err)
    }
     

}

export const handle_cncl_trnctn = async(req, res , next)=>{
    console.log("ima in get_transi cancl",req.user_id)
    console.log(req.body)
    const user_id = req.user_id 
    const ids = req.body.ids
    const reason = req.body.reason 
    const trans_id  = req.body.trans_id 
    const delids = req.body.upids
    let msg = ""
    let send_id = ""
    let who = ""

    if(user_id ===ids.owner_id){
        who = "owner"
        msg = "The owner had canceled the swap"
        send_id = ids.requester_id
    }
    else if(user_id ===ids.requester_id){
        who = "requester"
        msg = "The requester had canceled the swap"
        send_id = ids.owner_id
    }
    else{
        next(new Error("something is wrong with the ids pls try again"))
    }

  
    
    const ans = await cncl_transctn_db(delids,trans_id , who ,reason)
    console.log("iam in trans_info",ans)
    if(ans.success){
        send_notifiaction(user_id,send_id,"Swap Transaction" , msg)
        res.json({data: ans.info })
    
    }
    else{
        const err = new Error("Error in login:please login again")
        err.status = 501
        next(err)
    }
     

}
export const handle_notiSeen = async(req, res , next)=>{
     const user_id = req.user_id
     console.log(user_id)
     const ans = noti_seen_db(user_id)
     res.json(ans)




}
export const handle_read_cht = async(req, res , next)=>{
     const user_id = req.user_id
     const from_ids = req.body.ids
     console.log(user_id)
     const ans = chat_seen_db(user_id,from_ids)
     res.json(ans)




}

export const logout = (req, res) => {
    console.log("iam loggged out")
    try {
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        });

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        });

        return res.json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Logout failed"
        });
    }
};