const {createClient} = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res){
    if(req.method !== 'POST'){
        return res.status(405).json({error: 'Method not allowed'});
    }

    try{
        const {user_id, name, exercises } = req.body;

        const {data, error} = await supabase
            .from('fitness_routines')
            .insert( [{ user_id, name, exercises }])
            .select();

        if (error) throw error;

        return res.status(200).json(data[0]);
    }catch(err){
        return res.status(500).json({ error: err.message});
    }
}
