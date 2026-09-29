import pg  from 'pg';
import { pool } from '../configs/database_config.js';

import {createUpdateQuery} from './protected_helper_controlers.js'

export const get_myListing_db =async (user_id)=>{
    console.log("iam in db")
    try{
        const query_string = `select * from clothing_info where  user_id = $1`
        const ans = (await pool.query(query_string,[user_id])).rows
        return {success :true , data : ans}
    }
    catch(error){
        console.log(error)
        return {success:false}
        
    }

}
export const get_myRequets_db =async (user_id)=>{
    console.log("iam in request db")
    try{
        const query = `
       SELECT
       c.* ,s.id AS swrq_id,
       s.status AS swrq_status,
       s.created_date As when_req
        FROM swap_requests s
        JOIN clothing_info c
            ON c.id = s.owner_cloth_id
        WHERE s.requester_id = $1;
        `;

        const ans = (await pool.query(query, [user_id])).rows;
            return {success :true , data : ans}
        }
    catch(error){
        console.log(error)
        return {success:false}
    }

}
export const get__myWish_db=async (user_id )=>{
    console.log("iam in  myWish db")
    
    try{
      const Q = `
            SELECT
                w.id AS wishlist_id,
                w.created_at AS wishlist_created_at,

                c.*

            FROM wish_list w

            JOIN clothing_info c
                ON w.clothing_id = c.id

            WHERE w.user_id = $1

            ORDER BY w.created_at DESC;
        `;


        const result = await pool.query(Q, [user_id])
        const transactions = result.rows.slice(0, 10);
            return {success :true , data : transactions }
        }
    catch(error){
        console.log(error)
        return {success:false}
    }

}

export const get__myhist_db=async (user_id , offset )=>{
    console.log("iam in  myKert db")
    
    try{
        const Q = `
        SELECT *
        FROM swap_transactions
        WHERE status = 'completed'
        AND (owner_id = $1 OR requester_id = $1)
        ORDER BY completed_at DESC
        LIMIT 11
        OFFSET $2;
        `;

        const result = await pool.query(Q, [
            user_id,
            offset
        ]);

        const hasMore = result.rows.length > 10;
        const transactions = result.rows.slice(0, 10);
            return {success :true , data : transactions , hasMore :hasMore}
        }
    catch(error){
        console.log(error)
        return {success:false}
    }

}

export const get_all_reqres_db =async (user_id)=>{
    console.log("iam in request db")
    try{
        const query = `
            SELECT
                c.*,
                s.owner_cloth_id ,s.id AS swrq_id
            FROM swap_requests s
            JOIN clothing_info c
                ON c.id = s.requester_cloth_id
            WHERE s.owner_id = $1
            AND s.status = 'pending';
        `;
        const ans = (await pool.query(query, [user_id])).rows;
            return {success :true , data : ans}
        }
    catch(error){
        console.log(error)
        return {success:false}
    }

}

export const update_Requets_db =async (user_data)=>{
    console.log("iam in request update db")
    try{
        const query = `
            INSERT INTO swap_requests
            (
                requester_id,
                owner_id,
                owner_cloth_id,
                requester_cloth_id
            )
            VALUES ($1, $2, $3, $4) ;
        `;
             await pool.query(query,user_data)
            return {success :true}
        }
    catch(error){
        console.log(error)
        return {success:false}
    }

}
export const update_side_db =async (user_prod_id ,owner_product_id)=>{
    console.log("iam in request update db")
    try{
     
        const query = `
            UPDATE clothing_info
            SET status = 'inactive'
            WHERE id = $1
            RETURNING name , category;
        `;

        const values = [user_prod_id];
        const ans = (await pool.query(query, values)).rows[0];

        await pool.query(
            `SELECT update_clothing_status($1)`,
            [owner_product_id]
        );    

        return {success:true , name : ans.name, category :ans.category}
        }
    catch(error){
        console.log(error)
        return {success:false}
    }

}


export const  add_to_wishlist = async(user_id, clothing_id)=> {
    try {
        // Check how many items this user already has
        const count_query = `
            SELECT COUNT(*) AS like_count
            FROM wish_list
            WHERE user_id = $1;
        `;

        const count_result = await pool.query(count_query, [user_id]);

        const like_count = Number(count_result.rows[0].like_count);

        if (like_count >= 10) {
            return {
                success: false,
                message: "You can only like 10 items."
            };
        }

        // Insert the new like
        const insert_query = `
            INSERT INTO wish_list (user_id, clothing_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, clothing_id)
            DO NOTHING
            RETURNING *;
        `;

        const result = await pool.query(insert_query, [
            user_id,
            clothing_id
        ]);

        if (result.rows.length === 0) {
            return {
                success: false,
                message: "Item is already in your wishlist."
            };
        }

        return {
            success: true,
            data: result.rows[0]
        };

    } catch (error) {
        console.error("Wishlist error:", error);

        return {
            success: false,
            message: "Failed to add item to wishlist."
        };
    }
}
export const del_to_wishlist = async (user_id, clothing_id) => {
    console.log("iam in del wish_list")
    try {

        const del_query = `
            DELETE FROM wish_list
            WHERE user_id = $1
            AND clothing_id = $2
            RETURNING *;
        `;

        const result = await pool.query(del_query, [user_id, clothing_id]);

        return {
            success: true,
            data:result.rows
        };

    } catch (error) {
        console.error("Error deleting from wishlist:", error);

        return {
            success: false,
            error: error.message
        };
    }
};



export const del_to_clothing = async (user_id, clothing_id) => {
    console.log("iam in del cloth" , user_id,clothing_id)
    try {

        const del_query = `
            DELETE FROM clothing_info
            WHERE user_id = $1
            AND id = $2
            RETURNING *;
        `;

        const result = await pool.query(del_query, [user_id, clothing_id]);
        console.log("hi")

        return {
            success: true,
            data: result.rows
        };

    } catch (error) {
        console.error("Error deleting clothing:", error);

        return {
            success: false,
            error: error.message
        };
    }
};

export const del_to_swap_request = async (request_id) => {
    console.log("iam in del cloth")
    try {
    const del_query = `
        DELETE FROM swap_requests
        WHERE id = $1
        RETURNING requester_cloth_id, owner_cloth_id ,owner_id;
    `;

    const result = await pool.query(del_query, [request_id]);

    if (result.rows.length === 0) {
        return {
            success: true,
            message: "Swap request not found"
        };
    }

    const owner_cloth_id = result.rows[0].owner_cloth_id;
    const owner_id = result.rows[0].owner_id;
    const req_cloth_id = result.rows[0].requester_cloth_id;
    const upQuery = `
          UPDATE clothing_info
            SET status = 'active'
            WHERE id = $1;
        `;
    const ans = await pool.query(upQuery, [req_cloth_id]);

    await pool.query(
        `SELECT update_clothing_status($1)`,
        [owner_cloth_id]
    );

    return {
        success: true,
        data: result.rows,
        owner_id : owner_id
    };

    }  catch (error) {
        console.error("Error deleting swap request:", error);

        return {
            success: false,
            error: error.message
        };
    }
};

