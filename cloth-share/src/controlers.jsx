const API_URL = import.meta.env.VITE_API_URL;






export async function refrsh_jwt_token(){
   
    console.log("sending request to srver for jwt")
    try{
        const res = await fetch(`${API_URL}/api/refresh_token`, {
            credentials: "include"
        })
        if(res.ok){
            const data = await res.json()
            console.log(data)
            return {success : true}
        }
        else{
            throw new Error("error")
        }

    }
  
    catch(err) {
            console.log(err)
            alert("please login again to continue")}
            return {success : false}        
}


export async function get_my_Listing(is_refresh) {
    
    try {
        console.log("iam here")
        const res = await fetch(`${API_URL}/protectedApi/get_myListings`, {
            credentials: "include"
        });
      

        if (res.ok) {
            const data = await res.json();
          
            return  data
        }

        if (res.status === 401 && is_refresh) {
            const refreshed = await refrsh_jwt_token();

            if (refreshed.success) {
                console.log("hi token rfreshed ")
                return get_my_Listing(false);
            }
        }

        throw new Error(`Request failed: ${res.status}`);
       
    }
    catch (error) {
        console.error("Error loading listings:", error);
        return {success : false}
    }
}
export async function get_my_Request(is_refresh) {
    console.log("getting request")
    
    try {
        console.log("iam here")
        const res = await fetch(`${API_URL}/protectedApi/get_myRequests`, {
            credentials: "include"
        });
        console.log(res)

        if (res.ok) {
            const data = await res.json();
            console.log("My requests:", data);
            return data
        }

        if (res.status === 401 && is_refresh) {
            const refreshed = await refrsh_jwt_token();

            if (refreshed.success) {
                console.log("hi token rfreshed ")
                return get_my_Listing(false);
            }
        }

        throw new Error(`Request failed: ${res.status}`);
       
    }
    catch (error) {
        console.error("Error loading listings:", error);
        return {success : false}
    }
}
           

//get_my_WishList ,get_my_History


export async function get_my_Kart(iswish,ishist,is_refresh) {
    console.log("getting request")
    
    try {
        console.log("iam here")
        const res = await fetch(`${API_URL}/protectedApi/get_myKart`, {
            method:"POST",
            credentials: "include",
            headers :{
              "Content-Type" : "application/json"
            },
            body : JSON.stringify({iswish :iswish , ishist :ishist})
        });
        console.log(res)

        if (res.ok) {
            const data = await res.json();
            console.log("My requests:", data);
            return data
        }

        if (res.status === 401 && is_refresh) {
            const refreshed = await refrsh_jwt_token();

            if (refreshed.success) {
                console.log("hi token rfreshed ")
                return get_my_Listing(false);
            }
        }

        throw new Error(`Request failed: ${res.status}`);
       
    }
    catch (error) {
        console.error("Error loading listings:", error);
        return {success : false}
    }
}

export async function get_my_WishList(is_refresh) {
   
    
    try {
        console.log("iam here")
        const res = await fetch(`${API_URL}/protectedApi/get_my_WishList`, {
            credentials: "include"
        });
        console.log(res)

        if (res.ok) {
            const data = await res.json();
            console.log("My requests:", data );
            return data
        }

        if (res.status === 401 && is_refresh) {
            const refreshed = await refrsh_jwt_token();

            if (refreshed.success) {
                console.log("hi token rfreshed ")
                return get_my_Listing(false);
            }
        }

        throw new Error(`Request failed: ${res.status}`);
       
    }
    catch (error) {
        console.error("Error loading listings:", error);
        return {success : false}
    }
}

export const send_liked = async (prduct_id,is_refresh) => {
    try {
        const res = await fetch(`${API_URL}/protectedApi/like_update`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                prod_id: prduct_id
            })
        });
        if(res.ok){
            return {success :true}
        }

        if (res.status === 401 && is_refresh) {
            const refreshed = await refrsh_jwt_token();

            if (refreshed.success) {
                console.log("hi token rfreshed ")
               send_liked(false);
            }
        }

        throw new Error(`Request failed: ${res.status}`);
        

    } catch (error) {
        console.error("Error sending like:", error);
        return {success :false}
    }
};