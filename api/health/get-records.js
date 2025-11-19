const {createClient} = require('@supabase/supabase-js');
const supabase = createClient(
    process.env.VITE_SUPABASE_URL, 
    process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req,res) {
    if(req.method !== 'GET') {
        return res.status(405).json({error: 'Method not allowed'});
    }

    try{
        const {user_id, type} = req.query;
        let query = supabase
            .from('health_records')
            .select('*')
            .eq('user_id', user_id);
        
        if (type) query = query.eq('type', type);

        const {data, error} = await query;
        if(error) throw error;

        return res.status(200).json(data);
    }catch(err){
        return res.status(500).json({error: err.message});
    }
}