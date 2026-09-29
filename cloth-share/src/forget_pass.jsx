import { useActionState, useState,useEffect } from "react";
import "./forget_pass.css";
const API_URL = import.meta.env.VITE_API_URL;

const OtpUrl =`${API_URL}/api/send-otp`
const passUrl =`${API_URL}/api/verify-otp`


async function verifyOTP(previousState, formData) {
  const email = formData.get("email");
  console.log("sending emial...");
  console.log("Email:", email);
  if(email.length === 0){
    return {success: "check the email is correct?" , email: email}

  }

  const res =await fetch(OtpUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({email : email}),
    });
    
   
    if(res.ok){
      const data = await res.json();
    
      if(data.message === "OTP sent successfully"){

        return {success: data.message, email : email}
      }
      else{
        return {success: data.message, email : email}
      }
    }
    else{
        return {success: data.error  , email : email}

    }


}





async function resetPassword(previousState, formData) {
  const email = formData.get("email");
  const pass = formData.get("pass");
  const cpass = formData.get("cpass");
  const otp = formData.get("otp");
  
  

  console.log("Reset password requested");
  console.log("Email:", email);

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (pass !== cpass) {
    return {
      error: "Password and confirm password do not match",
      pass:pass,
    };
  }

  if (!passwordRegex.test(pass)) {
    return {
      error:"Minimum 8 characters, with uppercase, lowercase, number and special character",
      pass:pass
    };
  }
  console.log("->",otp.length)
  if(otp.length < 6){
    return {
      error: "check the otp please",
      pass:pass,

    };

  }

  console.log("Password validation passed");

   const res =await fetch(passUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({email:email , password : pass , otp : otp}),
    });
    const data = await res.json()
    console.log(data , "-->")
    if(res.ok){
      return {success: data.message};

    }
    else{
      return {error: data.message};

    }

 
}

export default function ForgotPassword() {
  const [state, formAction, isPending] = useActionState(verifyOTP,null);

  const [data, form2Action, is2Pending] = useActionState(resetPassword,null);
 

  const [email, setEmail] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  useEffect(() => {
      if (state?.success === "OTP sent successfully") {
          setIsOtpVerified(true);
      }
    }, [state]);

  return (
    <div className="forgot-page">
      <div className="forgot-card">

        {!isOtpVerified ? (
          <>
            <div className="forgot-header">
              <h2>Forgot Password?</h2>
              <p>
                Enter your email and we'll send you an OTP
                to reset your password.
              </p>
            </div>

              <form action={formAction} className="forgot-form">
                <label htmlFor="email">Email</label>

                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  defaultValue={state?.email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <button
                    type="submit"
                  className="primary-btn"
                  disabled={isPending}
                >
                
                  Send OTP
                </button>
                {isPending&& <p>loading</p>}


                
              </form>


            {state?.success && (
              <p className="success-message">
                {state.success}
              </p>
            )}
   
            
          </>
        ) : (
          <>
            <div className="forgot-header">
              <h2>Create New Password</h2>
              <p>
                Enter a strong password for your account.
              </p>
            </div>

            <form action={form2Action} className="forgot-form">
              <input
                type="hidden"
                name="email"
                value={email}

              />
    
              <label htmlFor="otp">OTP</label>

                <input
                  type="text"
                  id="otp"
                  name="otp"
                  placeholder="Enter OTP"
                />

              <label htmlFor="pass">
                New Password
              </label>

              <input
                type="password"
                id="pass"
                name="pass"
                placeholder="Enter new password"
                defaultValue={data?.pass}
             />

              <label htmlFor="cpass">
                Confirm Password
              </label>

              <input
                type="password"
                id="cpass"
                name="cpass"
                placeholder="Re-enter new password"
                
              />

              <button
                type="submit"
                className="primary-btn"
                disabled={is2Pending}
              >
                {is2Pending
                  ? "Changing..."
                  : "Change Password"}
              </button>

              {data?.error && (
                <p className="error-message">
                  {data.error}
                </p>
              )}

              {data?.success && (
                <p className="success-message">
                  {data.success}
                </p>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}