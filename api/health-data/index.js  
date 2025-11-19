const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res){
    if(req,method === 'POST'){
        try{
            const {user_id, type, value, date} = await request.json();

            const {data, error } = await supabase
                .from('health_records')
                .insert( [ {user_id, type, value, date}])
                .select();

            if(error) throw error;
            return new Response(JSON.stringify(data), {status: 200});
        }catch(err){
            return new Response(JSON.stringify({error: err.message}), {status:500})
        }
    } else if(req.method === 'GET'){
        try{
            const {searchParams} = new URL(request.url);
            const user_id = searchParams.get('user_id');
            const type = searchParams.get('type');

            let query = supabase.from('health_records').select('*').eq('user_id', user_id);
            if(type) query = query.eq('type', type);

            const {data, error} = await query;
            if(error) throw errror;

            return new Response(JSON.stringify(data), {status: 200});
        }catch(err) {
            return new Response(JSON.stringify({ error: err.message}), {status:500})
        }
    }
}