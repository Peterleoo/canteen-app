// supabase/functions/reverse-geocode/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

serve(async (req) => {
  // 1. 处理浏览器的预检请求 (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { searchParams } = new URL(req.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')

    if (!lat || !lng) throw new Error('缺少经纬度参数')

    // 2. 从环境变量中读取高德 Key (Web服务类型)
    const AMAP_KEY = Deno.env.get('AMAP_SERVICE_KEY')
    if (!AMAP_KEY) throw new Error('未配置高德地图 API 密钥')

    // 3. 调用高德 API
    const response = await fetch(
      `https://restapi.amap.com/v3/geocode/regeo?location=${lng},${lat}&key=${AMAP_KEY}&extensions=all`
    )
    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  // GET 请求示例
  curl -i --location --request GET 'http://127.0.0.1:54321/functions/v1/reverse-geocode?lat=28.199110&lng=112.991201&radius=500'

  // POST 请求示例
  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/reverse-geocode' \
    --header 'Content-Type: application/json' \
    --data '{"lat": "28.199110", "lng": "112.991201", "radius": "500"}'

*/
