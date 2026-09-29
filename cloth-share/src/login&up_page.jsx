import { useActionState, useEffect, useState } from 'react';
import './login_page.css';
import {useNavigate ,Link} from "react-router-dom";


//login fetch function
const fetch_log = async (un , pass ,cpass,mail,js_send,log_url)=>{

    try{
      const res = await fetch(log_url , {
            method : "POST" ,
            credentials: "include",
            headers :{
              "Content-Type" : "application/json"
            },
            body :JSON.stringify(js_send)
            
          });
      const data = await res.json(); 
      console.log(data)
      if(data.msg === 'successfull' && res.ok){
        return {success : data.msg}
      }

      else{
        console.log("---->",data.error)
        throw new Error(data.error)
      }      
    }
    catch(er){
      console.log("error",er.message)
      return {er : er.message ,un ,pass ,cpass ,mail }
    }
}

//handle the early validation
const handle_Login = async (state , frm_data) =>{
  let un= frm_data.get("username")
  let  pass = frm_data.get("password")
  let  cpass = frm_data.get("cpassword")
  let  mail = frm_data.get("Email")
  let ilg = frm_data.get("islog")
  let islog  = ilg === "true" ? true : false
  const log_url = islog ?`http://localhost:8000/api/signup`: `http://localhost:8000/api/login`
  const js_send = {username : un , password : pass , gmail : mail };
  const passwordRegex =/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  


  if(un && pass && mail ){
    const isPass = passwordRegex.test(pass);
    if(!isPass) {return {er : "min-char = 8 , must have atleast one Uppercase ,Lowercase, Number and special charcter",un ,pass ,cpass ,mail }};
      if(pass === cpass || !islog){
        /*fetch */
        return fetch_log(un ,pass,cpass ,mail,js_send ,log_url)
      }
        return {er : "mis-matching password",un ,pass ,cpass ,mail }


      }
  }


function Auth(props) {
  const [islog , setIslog] = useState(true)
  const [data ,action , panding] = useActionState(handle_Login)
  const navi = useNavigate()
  console.log(islog)
  
  useEffect(() => {
    if(data?.success && data.success)
    {
    props.setIslogedin(true)
    navi('/')
    }
   }, [data]);
 

  return (

    <div className="auth_parent">

      
      
      <form action={action} className = "auth_form">
        <input
            type="hidden"
            name="islog"
            value={islog}
        />
        <span className='text_welcome' >Welcome to  <br></br><h2 className='welcome'>Cloth Share </h2></span>
        <span className='text_login'>{islog ? "Sign Up": "Log In"}{!islog && <Link to= "/reset">Forogot Password?</Link>}</span>
        <div className='input_container' >
          <p className='input_desc'>Username :</p>
          <input defaultValue={data?.un} name = "username" className="auth_input" type="text" placeholder="Username" />
        </div>
        
          <div className='input_container'>
            <p className='input_desc'>Email :</p>
            <input  defaultValue={data?.mail}  name = "Email"  className="auth_input" type="email" placeholder="Email" />
          </div>
       
        <div className='input_container'>
          <p className='input_desc'>Password :</p>
          <input  defaultValue={data?.pass}  name = "password" className="auth_input" type="password" placeholder="Password"  />
        </div>
        {islog&&       
          <div className='input_container'>
              <p className='input_desc'>Confirm password : </p>
              <input  defaultValue={data?.cpass}  className="auth_input"  name = "cpassword"  type="password" placeholder="Password" />
          </div>
          }

        <span id = "islog" onClick={() =>setIslog(!islog)}> {islog ? "Already have an account? Log in":"Dont have an account ? sign up"}</span>

        <p style={{color : "red"}}>{data?.er}</p>
       
        {panding ? <p>loading ....</p>:
        <button  onClick={() => console.log("clicked")} className = "sumbt" type="submit">Login</button>
        }
      </form>
    </div>
  )
}
export default Auth;