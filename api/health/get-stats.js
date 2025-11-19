const {createClient} = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY);
    
export default async function handler(req, res) {
    if (req.method !== 'GET'){
        return res.status(405).json({error: 'Method not allowed'});
    }

    try{
        const {user_id, period} = req.query;
        let dateFilter = new Date();

        if (period == '7days') dateFilter.setDate(dateFilter.getDate() -7);
        if (period == '30days') dateFilter.setDate(dateFilter.getDate() -30);

        const {data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('user_id', user_id)
        .gte('date', dateFilter.toISOString().split('T')[0]);

        if(error) throw error;

        return res.status(200).json(data);

    }catch(err) {
        return res.status(500).json({error : err.message});
    }
}