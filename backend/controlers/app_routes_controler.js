import { insert_user, sign_in_retrive, update_user ,load_cloth_from_db ,search_cloth_from_db } from '../controlers/databse.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import  nodemailer from "nodemailer" ;
import transporter from '../configs/mail_sender_config.js'
import "dotenv/config";


const  acces_s_key  =  process.env.acces_s_key
const refresh_key = process.env.refresh_key



 
const otpStore = new Map()


    


const sign_name = (res , username ,toke_name,secrete_key , exptime ) =>{
    const token =  jwt.sign( username , secrete_key , {expiresIn :exptime})
    console.log(token)
    res.cookie(toke_name, token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax"
  });


}


export const loginController = async(req ,res , next)=>{
    console.log("iam in login",req.body)
    const pass =req.body.password
    

     //  data base retrive hased-pass 
    const hss_pass = await  sign_in_retrive({name :req.body.username , email :req.body.gmail })
    console.log("---> hased", hss_pass)
    if(hss_pass.msg === "un-succesfull"){ 
        const err = new Error("un-successfull : account with this email not found")
         err.status = 401
         next(err)

    }
    else{

    //decrypt
    const is_legit =await bcrypt.compare(pass , hss_pass.hash_pass ) 
    console.log(is_legit)
    if(is_legit) {
        
        sign_name(res , {id : hss_pass.id} , "accessToken" , acces_s_key ,'15m')
        sign_name(res , {id : hss_pass.id}, "refreshToken" , refresh_key,'1d')

         res.json({msg : "successfull"})
    }
    else{
         const err = new Error("un-successfull : password is incorrect")
         err.status = 401
         next(err)
        

    }
}
  
}

export const signupController = async(req ,res , next)=>{
    console.log("iam in signup",req.body)
    const username = req.body.username
    const pass =req.body.password
    const gmail = req.body.gmail
    const loc = "no data available"
    console.log(pass)

    

    //encrypt
    const hassed_pass = await bcrypt.hash(pass ,10)
    console.log(hassed_pass)

    //add it to data base 
    const res_query =  await insert_user({name : username , hassed_pass :hassed_pass , email :gmail , location :{}});
    console.log(res_query.msg ,res_query.id  )
    if(res_query.msg === 'succesfull'){
        const id_string = {id :res_query.id }
        //jwt token
        sign_name(res , id_string , "accessToken" , acces_s_key ,'15m')
        sign_name(res , id_string , "refreshToken" , refresh_key,'1d')
        res.json({msg : "successfull"})
    }
    else {
      const err = new Error("Emial error: email already have account");
      err.status = 401;
      next(err);
    }

}
    

export const sendotp = async (req, res , next) => {
    console.log("user:",process.env.Email_app_user,
    "pass:",process.env.Email_app_pass)
    console.log("-----> ", transporter)
    try {
        const { email } = req.body;
        console.log(otpStore.has(email))
        if(otpStore.has(email)){
           return res.json({message: "OTP is already sent ,and sent otp is vailid for 5 min so try after 5 min"})

        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        otpStore.set(email, {
            otp: otp,
            expiresAt: Date.now() + 5 * 60 * 1000,
            });

        console.log("OTP:", otp);

        await transporter.sendMail({
            from: process.env.Email_app_user,
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
        });

        res.json({
            message: "OTP sent successfully",
        });
    }
    catch(error){
        console.log(error)
        const er = new Error(" something went wrong! please check your email and try again")
        er.status =501
        next(er)
    }
}


export const verfyotp = async(req, res , next)=>{
    const {password,email , otp}= req.body 
    

    ///hash the pass
    const hassed_pass = await bcrypt.hash(password ,10)
    console.log(" ->",hassed_pass)

    const legitOtp = otpStore.get(email)
    console.log(String(legitOtp.otp)  === String(otp))
    if(String(legitOtp.otp)  === String(otp)){
        const ans = await update_user({pass : hassed_pass  , email : email})
        console.log("masg ->",ans)
        res.json({message :ans.msg})

        
    }
    else{
        res.json({message : "error: otp is incorrect"})
    }

   
}





export const refresh_token_function=(req,res ,next)=>{
    const ref_token = req.cookies.refreshToken
  
    try{
    //verify the refreshtoken
        const vrfy = jwt.verify(ref_token , refresh_key)

        console.log("successfull",vrfy)
          //issue new acces token 
        sign_name(res , {id:vrfy.id} , "accessToken" , acces_s_key,'15s')
        res.json({msg : "refresh successfull"})
    }
    catch(eror){
        next(eror)
        console.log(eror)
    }


}

export const load_cloth_handler =  async(req, res , next) =>{
    console.log("ima in load cloth",req.body)
    const  loc = req.body?.location || false;
    const byserach = req.body?.bysearch ||false;
    const type = req.body?.loc_type ||false
    
    console.log(loc , byserach )
    

    if(byserach && !type){

        const { searching_type, text } = req.body;
        console.log(searching_type , text)
        const query_string = `
        SELECT *
        FROM clothing_info
        WHERE ${searching_type}  ILIKE TRIM($1)
         AND status IN ('active', 'pending');
        `;
        const query_data = [ text]
        console.log(query_string)
        const db_data =await search_cloth_from_db (query_data,query_string)
        if(db_data.success && db_data.ans !== null){
            return res.json(db_data.ans)
        }  
        else{
            const err =  new Error("Not found")
            err.status(409)
            next(err)
        }

       
    }


    if(loc && req.isloged ){
        //user recomendation 
        const query_data  = [loc.country ,loc.state , loc.pin]
        const db_data =await load_cloth_from_db(query_data)
       
        return res.json(db_data)
    }
    else { 
        
        const query_data  = ["India", "Karnataka", 560001]
        const db_data = await load_cloth_from_db(query_data)
       
        return res.json(db_data) 
    }
  

}


