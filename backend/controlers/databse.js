import pg  from 'pg';
import { pool } from '../configs/database_config.js';

import {createUpdateQuery} from './protected_helper_controlers.js'


export const datacreate = async ()=>{
    const Q = `CREATE TABLE IF NOT EXISTS user_info( 
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user',

    location JSONB,

    profile_image_url TEXT,

    reputation_score NUMERIC(8,5) DEFAULT 0,
    total_swaps INTEGER DEFAULT 0,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
    await pool.query(Q)


    const Q2 = `

        CREATE TABLE IF NOT EXISTS  clothing_info(
            id SERIAL PRIMARY KEY,

            user_id UUID NOT NULL
            REFERENCES user_info(id)
            ON DELETE CASCADE,
            
            name VARCHAR(150) NOT NULL,
            country VARCHAR(100),
            state VARCHAR(100),
            postal_code VARCHAR(20),
            category VARCHAR(50) NOT NULL,
            sub_category VARCHAR(50),


            brand VARCHAR(100),
            size VARCHAR(20),
            gender VARCHAR(20),
            color VARCHAR(50),
            material VARCHAR(50),

            condition VARCHAR(30),
            worn VARCHAR(30),
            defects VARCHAR(10),

            description TEXT,

            swap_size VARCHAR(20),
            estimated_value NUMERIC(10,2),

            img1 TEXT,
            img2 TEXT,
            img3 TEXT,
            status VARCHAR(20) NOT NULL DEFAULT 'active'
                    CHECK (status IN (
                        'active',
                        'pending',
                        'inactive',
                        'accepted'

                    )),




            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`
     await pool.query(Q2)

     const Q3 = `
        CREATE TABLE IF NOT EXISTS swap_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    requester_id UUID NOT NULL
        REFERENCES user_info(id)
        ON DELETE CASCADE,

    owner_id UUID NOT NULL
        REFERENCES user_info(id)
        ON DELETE CASCADE,

    owner_cloth_id INTEGER NOT NULL
        REFERENCES clothing_info(id)
        ON DELETE CASCADE,

    requester_cloth_id INTEGER NOT NULL
        REFERENCES clothing_info(id)
        ON DELETE CASCADE,

    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    status VARCHAR(30) DEFAULT 'pending'
        CHECK (status IN (
            'pending',
            'accepted',
            'rejected',
            'cancelled',
            'completed'
        ))
);
            

`  
    await pool.query(Q3)
    const Q31 = `
        CREATE OR REPLACE FUNCTION update_clothing_status(cloth_id INTEGER)
        RETURNS VOID AS $$
        DECLARE
            request_count INTEGER;
        BEGIN
            SELECT COUNT(*)
            INTO request_count
            FROM swap_requests
            WHERE owner_cloth_id = cloth_id  
            AND status = 'pending';

            UPDATE clothing_info
            SET status = CASE
                WHEN request_count >= 3 THEN 'inactive'
                ELSE 'active'
            END
            WHERE id = cloth_id;
        END;
        $$ LANGUAGE plpgsql;
        `;

    await pool.query(Q31);

    const Q4 = `
        CREATE TABLE IF NOT EXISTS swap_transactions (

            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),


            owner_id UUID NOT NULL
                REFERENCES user_info(id)
                ON DELETE RESTRICT,

            requester_id UUID NOT NULL
                REFERENCES user_info(id)
                ON DELETE RESTRICT,
        


            -- Snapshot of owner's item at the time of transaction
            owner_item JSONB NOT NULL,

            -- Snapshot of requester's item at the time of transaction
            requester_item JSONB NOT NULL,

            -- Rating given to the owner
            owner_rating JSONB,

            -- Rating given to the requester
            requester_rating JSONB,



            status VARCHAR(30) NOT NULL DEFAULT 'initiated'
                CHECK (status IN (
                    'initiated',
                    'completed',
                    'owner_completed',
                    'requester_completed',
                    'cancelled',
                    'owner_disputed',
                    'requester_disputed'
                )),


            owner_location TEXT,
            requester_location TEXT,

            completed_at TIMESTAMP,

            cancelled_at TIMESTAMP,

            cancellation_reason TEXT,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

           
        );
    `;

    await pool.query(Q4);
    const Q5 = `
        CREATE TABLE IF NOT EXISTS wish_list (

            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

            user_id UUID NOT NULL
                REFERENCES user_info(id)
                ON DELETE CASCADE,

            clothing_id INTEGER NOT NULL
                REFERENCES clothing_info(id)
                ON DELETE CASCADE,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,

            UNIQUE (user_id, clothing_id)
        );
    `;

    await pool.query(Q5);

    await pool.query(`
    CREATE TABLE IF NOT EXISTS friends (
        id SERIAL PRIMARY KEY,

        user1 UUID NOT NULL
            REFERENCES user_info(id)
            ON DELETE CASCADE,

        user2 UUID NOT NULL
            REFERENCES user_info(id)
            ON DELETE CASCADE,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CHECK (user1 <> user2)
            );

            CREATE UNIQUE INDEX IF NOT EXISTS unique_friend_pair
            ON friends (
                LEAST(user1, user2),
                GREATEST(user1, user2)
            );
`);
await pool.query(`
    CREATE TABLE IF NOT EXISTS all_chats (
        id SERIAL PRIMARY KEY,

        msgFrom UUID NOT NULL
            REFERENCES user_info(id)
            ON DELETE CASCADE,

        msgTo UUID NOT NULL
            REFERENCES user_info(id)
            ON DELETE CASCADE,

        msg TEXT NOT NULL,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        is_read BOOLEAN DEFAULT FALSE
    )
`);
await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,

        to_id UUID NOT NULL
            REFERENCES user_info(id)
            ON DELETE CASCADE,

        from_id UUID NOT NULL
            REFERENCES user_info(id)
            ON DELETE CASCADE,

        type VARCHAR(50) NOT NULL,
        msg TEXT,
       

        is_read BOOLEAN DEFAULT FALSE,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`);

}


export const insert_user = async(user_data) =>{
    console.log("ism in dbinsert",user_data)
    try {
        const query_string = `INSERT INTO user_info (name, email, password_hash, location) VALUES($1,$2,$3,$4 ) RETURNING id;`
        const query_data = [user_data.name , user_data.email , user_data.hassed_pass, user_data.location]
        const res =  (await pool.query(query_string ,query_data)).rows[0]
        console.log(res.id)
        return {msg : "succesfull" , id :res.id}

    }
    catch(err){
        console.log(err.error)
        return {msg : "un-succesfull"}

    }
}



export const  sign_in_retrive =async (user_data)=>{

    try {
      
        const query_string = `SELECT id,password_hash FROM user_info where email = $1 `
        const query_data = [ user_data.email ]

        const res =(await pool.query(query_string ,query_data))
        if (res.rows.length === 0) {
        return { msg: "un-succesfull" };
        }
        const user = res.rows[0]

      
        return {msg : "succesfull" , hash_pass : user.password_hash,id : user.id}

    }
    catch(err){
        console.log(err)
        return {msg : "un-succesfull"}

    }



}

export const update_user = async(user_data) =>{
      try {
        const query_update = `UPDATE user_info SET  password_hash = $1 WHERE email = $2;`
      
        const query_data = [user_data.pass, user_data.email]

        const res = await pool.query(query_update,query_data)
        return {msg : "succesfull" }

    }
    catch(err){
        console.log(err)
        return {msg : "un-succesfull"}

    }

   

}

export const cloth_upload = async(user_data ,user_id)=>{

    
     const cloth_upload_query = `
    INSERT INTO clothing_info (
        user_id,name,
        category,sub_category,brand,
        size,gender,color,material,
        condition,worn,defects,
        description,
        swap_size,estimated_value,
        img1,img2,img3
    )
    VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15, $16, $17, $18
        )
        RETURNING id;
    `;

    try {
        const countResult = await pool.query( ` SELECT COUNT(*) AS count FROM clothing_info WHERE user_id = $1 `, [user_id] );
        const productCount = Number(countResult.rows[0].count); 
    
        // 2. Limit to maximum 10 products
        if (productCount >= 10) {
             return { success: false, message: "You can add a maximum of 10 products." }; }
        const ans = await pool.query(cloth_upload_query , user_data)
        return {success: " succesfuly uploaded" ,id : ans }

         
    }
    catch(error){
        console.log(error)
        return {error : "something went wrong while uploading database"}
    }

}

export const load_cloth_from_db = async (loc)=>{
    
    try{

        const query_fecth = `
    WITH matched AS (
        SELECT c.*
        FROM clothing_info c
        WHERE c.country = $1
          AND c.state = $2
          AND c.postal_code::integer BETWEEN $3 - 5 AND $3 + 5
          AND c.status IN ('active', 'pending')
    ),
    fallback AS (
        SELECT c.*
        FROM clothing_info c
        WHERE c.status IN ('active', 'pending')
          AND NOT EXISTS (
              SELECT 1
              FROM matched m
              WHERE m.id = c.id
          )
    )
    SELECT *
    FROM (
        SELECT *, 0 AS priority
        FROM matched

        UNION ALL

        SELECT *, 1 AS priority
        FROM fallback
    ) AS result
    ORDER BY priority, created_at DESC
    LIMIT 20;
`;
         const ans = (await pool.query(query_fecth ,loc)).rows
         
         return ans 
         

    }
    catch(err){
        console.log(err)
        return {error: "failed"}
    }
}

export const insert_noti = async(From_id ,to_id ,type,msg )=>{
   
    console.log("insert notification")
    try{
        const ans = (await pool.query(`INSERT INTO notifications(to_id, from_id, type ,msg)VALUES($1, $2, $3 ,$4)`,[to_id,From_id,type,msg] )).rows[0];
        console.log("insert notification",ans)
     return {success : true , info : ans }
    }
    
    catch(error){
        console.log(error)
        return {success : false}
    }

}
export const get_user_info_db = async(user_data )=>{
   

    try{
        const get_user_qury = `SELECT
        id,
        name,
        email,
        role,
        location,
        profile_image_url,
        reputation_score,
        total_swaps,
        is_active,
        created_at,
        updated_at
         FROM user_info
      WHERE id = ANY($1)
    `;
    const ans = (await pool.query(get_user_qury ,[user_data])).rows
     return {success : true , info : ans }
    }
    
    catch(error){
        console.log(error)
        return {success : false}
    }

}
export const get_friend_db= async(user_data )=>{
   const get_friends_query = `
    SELECT
        u.id,
        u.name,
        u.profile_image_url
        FROM friends f
        JOIN user_info u
            ON u.id = CASE
                WHEN f.user1 = $1 THEN f.user2
                ELSE f.user1
            END
        WHERE f.user1 = $1 OR f.user2 = $1;
            `;

    try{
       
    const ans = (await pool.query(get_friends_query,[user_data])).rows
     return {success : true , info : ans }
    }
    
    catch(error){
        console.log(error)
        return {success : false}
    }

}
export const get_transctn_db= async(user_data )=>{
   const get_friends_query = `SELECT *FROM swap_transactions
                                WHERE (owner_id = $1 OR requester_id = $1)
                                AND status NOT IN ('cancelled', 'completed')
                                ORDER BY created_at DESC;`;

    try{
       
    const ans = (await pool.query(get_friends_query,[user_data])).rows
     return {success : true , info : ans }
    }
    
    catch(error){
        console.log(error)
        return {success : false}
    }

}

export const get_allchat_db= async(user_data )=>{
   const get_all_query = ` SELECT *
                                FROM all_chats
                                WHERE msgfrom = $1 OR msgto = $1
                                ORDER BY created_at ASC;`;

    try{
       
    const ans = (await pool.query(get_all_query,[user_data])).rows
     return {success : true , info : ans }
    }
    
    catch(error){
        console.log(error)
        return {success : false}
    }

}


export const get_allnoti_db= async(user_data)=>{
   const get_all_query = ` SELECT * FROM notifications WHERE to_id = $1 
   ORDER BY created_at DESC;`;

    try{
       
    const ans = (await pool.query(get_all_query,[user_data])).rows
     return {success : true , info : ans }
    }
    
    catch(error){
        console.log(error)
        return {success : false}
    }

}




export const update_user_info_db = async(user_data, user_id)=>{
    console.log("iam in udpdatequerey create function")

    try{
        const ans_query = createUpdateQuery(user_data ,user_id)
        const get_user_qury =ans_query.query
        const values = ans_query.values
        console.log(get_user_qury,values)
        pool.query(get_user_qury ,values)
        
        return {success : true };
    }

    catch(error){
        console.log(error)
        return {error : error}
    }

}
export const chat_update = async(data)=>{
    console.log("iam in udpdatequerey create function")

    try{
       const query = `INSERT INTO all_chats (msgFrom, msgTo, msg) VALUES ($1, $2, $3) RETURNING *;`;
        const result = await pool.query(query, [data.From,data.To,data.msg]);

        console.log(result.rows[0]);
        const ans = result.rows[0];
        return {data:ans ,success : true };
    }

    catch(error){
        console.log(error)
        return {success : false}
    }

}


export const search_cloth_from_db = async (data ,query_string)=>{
    console.log("iam in serch_cloth_db")
    
    try{
        const ans = (await pool.query(query_string,data)).rows
        console.log(ans)
        return ({success : true , ans:ans})
    }
    catch(err){
        console.log(err)
        return {error: "failed"}
    }
}


export const del_ifuk_swap_request = async (swap_id, num_req) => {

     console.log("iam in del cloth")
    try {
        const updt_query= `
        UPDATE swap_requests
        SET status = 'rejected'
        WHERE id = $1
        RETURNING requester_cloth_id, owner_cloth_id,requester_id;
    `;

        const result = await pool.query(updt_query, [swap_id]);
        console.log("done del1" ,result.rows.length)
        if (result.rows.length === 0) {
            return {
                success: true,
                message: "Swap request not found"
            };
        }

         const owner_cloth_id = result.rows[0].owner_cloth_id;
         const req_cloth_id = result.rows[0].requester_cloth_id;
         const requester_id = result.rows[0].requester_id;
        console.log("done del2" ,num_req)
        const upQuery = `
          UPDATE clothing_info
            SET status = 'active'
            WHERE id = $1;
        `;
        const ans = await pool.query(upQuery, [req_cloth_id]);
    
        
        if(num_req < 3){
            return {success: true,data:[] ,owner_id : requester_id};
        }
        else{
            const ans2 = await pool.query(upQuery, [owner_cloth_id]);
                console.log("done del1")
            return {success: true,data: ans2.rows ,owner_id : requester_id};   
        }

    } catch (err) {
        console.log(err)
        return {success: false,data:[] ,owner_id :""};
    }
};



export const accpt_swap_request = async(userid,accpt_id,rqstr_id ,decline_id,owner_prod ,rqstr_prod)=> {

    console.log(userid , accpt_id,rqstr_id ,decline_id,owner_prod ,rqstr_prod)

     console.log("iam in del cloth")
    try {
        const updt_query= `
        UPDATE swap_requests
        SET status = 'rejected'
        WHERE id = ANY($1::uuid[])
        RETURNING requester_id ,status ;
    `;
    const insrt_query =`
    INSERT INTO swap_transactions (
        owner_id,
        requester_id,
     
        owner_item,
        requester_item,
        status
   
    )VALUES ($1,$2,$3::jsonb,$4::jsonb,$5)
    RETURNING *;
    `;
    const Q = ` INSERT INTO friends( user1 , user2 ) VALUES ($1,$2)  ON CONFLICT DO NOTHING`;
    const queryswp = `
    DELETE FROM swap_requests
    WHERE requester_cloth_id = $1
      AND owner_cloth_id = $2;
    `;
    const delquery = `DELETE FROM swap_requests WHERE requester_cloth_id = $1  ;`;

     
    const ans = (await pool.query(insrt_query ,[userid , rqstr_id, owner_prod , rqstr_prod , 'initiated'])).rows
    console.log("friend completed ",owner_prod.id,rqstr_prod.id)
    
    
    const ans0 = (await pool.query(delquery, [owner_prod.id])).rows;
    const ans_swp = (await pool.query(queryswp,[rqstr_prod.id,owner_prod.id])).rows;
    console.log("ansswap",ans_swp)
    const result = await pool.query(Q, [userid , rqstr_id]);
     console.log("friend completed ",ans0 )
    const ans2 = (await pool.query(updt_query ,[decline_id])).rows
    console.log("all completed ",ans2)
    const iDs = ans2.map(row => row.requester_id);
        console.log("dek ids",iDs)

    return {success : true , requester_id : iDs}



     } catch (err) {
        console.log(err)
       
        return {success : false,requester_id : []}
    }

}

export const cmplt_transctn_db= async(updt_ids,delids,trans_id , who ,rating , location )=>{
    console.log("{{{{{{{{{{{{{{",who)
    try{
        const query_string = who === "owner"
            ? `
                UPDATE swap_transactions
                SET
                    owner_rating = $1,
                    owner_location = $2,
                    status = CASE
                        WHEN requester_rating IS NOT NULL
                            THEN 'completed'
                        ELSE 'owner_completed'
                    END,
                    completed_at = CASE
                        WHEN requester_rating IS NOT NULL
                            THEN CURRENT_TIMESTAMP
                        ELSE completed_at
                    END
                WHERE id = $3
                RETURNING status;
            `
            : `
                UPDATE swap_transactions
                SET
                    requester_rating = $1,
                    requester_location = $2,
                    status = CASE
                        WHEN owner_rating IS NOT NULL
                            THEN 'completed'
                        ELSE 'requester_completed'
                    END,
                    completed_at = CASE
                        WHEN owner_rating IS NOT NULL
                            THEN CURRENT_TIMESTAMP
                        ELSE completed_at
                    END
                WHERE id = $3
                RETURNING status , owner_rating ,requester_rating;
            `;

        const ans1 = (await pool.query(query_string,[rating, location, trans_id])).rows[0];
        console.log(ans1);
        let imgsurl=[]
        if(ans1.status === 'completed'){
             imgsurl = (await pool.query(`DELETE FROM clothing_info WHERE id = ANY($1)RETURNING img2, img3;`,
            [delids])).rows;
            const ratngs = ans1.owner_rating.rate  + ans1.owner_rating.rate
            updt_ids.map(upid =>update_rating(upid,ratngs))
        }
        const img_urls = imgsurl.flatMap(row => [row.img2, row.img3]).filter(Boolean);
        console.log(img_urls)

        

        return {success : true ,imgsurl :img_urls}
     } catch (err) {
        console.log(err)
       
        return {success : false}
    }

    
} 


export const cncl_transctn_db = async (delids,trans_id,who,cancellation_reason) => {
     console.log("{{{{{{{{{{{{{{",who)
    try {

        const query_string = who === "owner"
            ? ` UPDATE swap_transactions
                SET
                    cancellation_reason = $1,
                    status = CASE
                        WHEN status = 'requester_disputed'
                            THEN 'cancelled'
                        ELSE 'owner_disputed'
                    END,
                    cancelled_at = CASE
                        WHEN status = 'requester_disputed'
                            THEN CURRENT_TIMESTAMP
                        ELSE cancelled_at
                    END
                WHERE id = $2
                RETURNING status;
            `
            : `
                UPDATE swap_transactions
                SET
                    cancellation_reason = $1,
                    status = CASE
                        WHEN status = 'owner_disputed'
                            THEN 'cancelled'
                        ELSE 'requester_disputed'
                    END,
                    cancelled_at = CASE
                        WHEN status = 'owner_disputed'
                            THEN CURRENT_TIMESTAMP
                        ELSE cancelled_at
                    END
                WHERE id = $2
                RETURNING status;
            `;

        const ans1 = (
            await pool.query(
                query_string,
                [cancellation_reason, trans_id]
            )
        ).rows[0];

        console.log("Transaction status:", ans1.status);


        // Transaction is fully cancelled
        if (ans1.status === "cancelled") {

            await pool.query(
                `
                    UPDATE clothing_info
                    SET status = 'active'
                    WHERE id = ANY($1);
                `,
                [delids]
            );
        }

        return {
            success: true,
            status: ans1.status
        };

    } catch (err) {

        console.log(err);

        return {
            success: false
        };
    }
};

export const  friend_id  =  async(userId)=>{
    const  Q1 = `SELECT
        CASE
            WHEN user1 = $1 THEN user2
            ELSE user1
        END AS friend_id
     FROM friends
     WHERE user1 = $1 OR user2 = $1`
    try{
      
    const result = (await pool.query(Q1,[userId])).rows;
    console.log("f:" , result)

    return{success:true  ,data : result }
    }catch(er){
        console.log(er)
        return{success: false}
    }
    



}
export const  noti_seen_db  =  async(to_id)=>{
    try{
    
    const query = `
        DELETE FROM notifications
        WHERE to_id = $1
    `;

    await pool.query(query, [to_id]);
    return{success:true }
    }catch(er){
        console.log(er)
        return{success: false}
    }
    
}
export const  chat_seen_db  =  async(to_id,from_ids)=>{
   
    try{
    
    await pool.query(
            `
            UPDATE all_chats
            SET is_read = TRUE
            WHERE msgTo = $1
            AND msgFrom = ANY($2)
            `,
            [to_id, from_ids]
        );
    return{success:true }
    }catch(er){
        console.log(er)
        return{success: false}
    }
    
}

export const update_profile_photot = async(id ,url)=>{
    try{
    await pool.query(
    `
    UPDATE user_info
    SET profile_image_url = $1
    WHERE id = $2;
    `,
    [url, id]);

    return {success : true}
    }catch(eror){
        console.log("error while update profile " ,eror)
        return {success : false}

    }

}
export const update_rating = async(user_id ,new_rating)=>{
    try{
            const result = await pool.query(
            `SELECT reputation_score, total_swaps
            FROM user_info
            WHERE id = $1`,
            [user_id]
        );

        const prevExp = Number(result.rows[0].reputation_score);
        const numSwaps = result.rows[0].total_swaps;
        const rating = Number(new_rating);

        const newExp =
            (prevExp * numSwaps + rating) / (numSwaps + 1);

        await pool.query(
            `UPDATE user_info
            SET reputation_score = $1,
                total_swaps = total_swaps + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2`,
            [newExp, user_id]
        );

    return {success : true}
    }catch(eror){
        console.log("error while update profile " ,eror)
        return {success : false}

    }

}

