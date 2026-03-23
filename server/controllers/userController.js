import sql from "../configs/db.js"


export const getUserCreations = async (req, res) => {
    try {
        const {userId} = req.auth()

        const creations = await sql`SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC`;

        res.json({ success: true, creations });

    } catch (error) {
        res.json({ success: false, message: error.message})
    }
}

export const getPublishedCreations = async (req, res) => {
    try {

        const creations = await sql`
        SELECT * FROM creations WHERE publish=  true ORDER BY created_at DESC`;

        res.json({ success: true, creations });

    } catch (error) {
        res.json({ success: false, message: error.message})
    }
}

export const toggleLikeCreation = async (req, res) => {
    try {
        const {userId} = req.auth()
        const {id} = req.body

        const [creation] = await sql `SELECT * FROM creations WHERE id = ${id}`

        if(!creation){
            return res.json({success: false, message: "Creation not found" })
        }

        const currentLikes = creation.likes;
        const userIdStr = userId.toString();
        let updatedLikes;
        let message;

        if (currentLikes.includes(userIdStr)){
            updatedLikes = currentLikes.filter((user)=>user !== userIdStr);
            message = 'Creation Unliked'
        } else{
            updatedLikes = [...currentLikes, userIdStr]
            message = 'Creation Liked'
        }

        const formattedArray = `{${updatedLikes.join(',')}}`

        await sql`UPDATE creations SET likes = ${formattedArray}::text[] WHERE id = ${id}`;

        res.json({ success: true, message });

    } catch (error) {
        res.json({ success: false, message: error.message})
    }
}

export const deleteCreation = async (req, res) => {
    try {
        const {userId} = req.auth()
        const {id} = req.body

        // Delete the creation only if it belongs to the authenticated user
        const result = await sql`DELETE FROM creations WHERE id = ${id} AND user_id = ${userId} RETURNING *`;

        if (result.length === 0) {
            return res.json({ success: false, message: "Creation not found or unauthorized" });
        }

        res.json({ success: true, message: "Creation deleted successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message})
    }
}

export const deleteMultipleCreations = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { ids } = req.body // Array of IDs
        
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.json({ success: false, message: "No IDs provided" });
        }

        // Delete multiple items belonging to the user
        const result = await sql`DELETE FROM creations WHERE id = ANY(${ids}) AND user_id = ${userId} RETURNING *`;

        res.json({ success: true, message: `${result.length} creations deleted successfully` });
    } catch (error) {
        res.json({ success: false, message: error.message})
    }
}
