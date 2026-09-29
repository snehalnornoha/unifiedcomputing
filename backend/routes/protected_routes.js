import express from 'express'
import upload from '../middle_ware/mltr.js'
import { cloth_share_upload ,handle_get_user_info ,handle_get_owner_info,
         handle_trns_req ,handle_edit_profile , send__myListing ,send__myRequest,
        send__myKart,upadte_like ,handle_cmplt_trnctn,get_all_chats ,logout} from '../controlers/protected_controlers.js'

import {del_wishList ,del_swapRequest ,del_clothing , all_resreqs ,get_multi_owner ,hanlde_accept_req ,get_friends,
        get_transactions ,handle_cncl_trnctn,get_all_noti,handle_notiSeen,handle_read_cht,handle_updtprofimg,send__wishList} from '../controlers/protected_controlers.js'


const p_routes = express.Router()


p_routes.post('/cloth_upload',upload.array('images'),cloth_share_upload)
p_routes.get('/get_user_info',handle_get_user_info)
p_routes.post('/get_owner_info',handle_get_owner_info)
p_routes.put('/edit_profile',handle_edit_profile)
p_routes.get('/get_myListings',send__myListing)
p_routes.get('/get_myRequests',send__myRequest)
p_routes.post('/get_myKart',send__myKart)
p_routes.get('/get_wishList',send__wishList)


p_routes.get('/all_resreqs',all_resreqs)
p_routes.get('/noti_seen',handle_notiSeen)



p_routes.post("/like_update",upadte_like )

p_routes.put('/snd_trnsctn_rqst',handle_trns_req)
p_routes.put('/updtprofimg',upload.array('images'),handle_updtprofimg)

p_routes.delete('/wishList',del_wishList)
p_routes.delete('/swap_request',del_swapRequest)
p_routes.delete('/myListing', del_clothing)


p_routes.post(`/get_owner_info_multi`,get_multi_owner)
p_routes.post(`/acceptreq`,hanlde_accept_req)
p_routes.get(`/friends`,get_friends)
p_routes.get(`/all_chats`,get_all_chats)
p_routes.get(`/all_noti`,get_all_noti)
p_routes.get(`/transactions`,get_transactions)
p_routes.post(`/cmplt_transation`,handle_cmplt_trnctn)
p_routes.post(`/cncl_transation`,handle_cncl_trnctn)
p_routes.put(`/chats_read`,handle_read_cht)
p_routes.post(`/logout`,logout)

export default p_routes;