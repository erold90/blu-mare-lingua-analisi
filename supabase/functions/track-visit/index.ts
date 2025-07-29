import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VisitData {
  page: string;
  referrer?: string;
  userAgent?: string;
}

interface GeoLocationData {
  country: string;
  country_code: string;
  region: string;
  region_code: string;
  city: string;
  latitude: number;
  longitude: number;
  ip: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get visitor IP first
    const clientIP = req.headers.get('cf-connecting-ip') || 
                    req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';

    console.log('📍 Visitor IP:', clientIP);

    const { page, referrer, userAgent }: VisitData = await req.json();

    // Non tracciare visite nell'area riservata
    if (page.includes('/area-riservata')) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Admin area visit not tracked' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get geo data from IP
    let geoData: GeoLocationData | null = null;
    
    if (clientIP !== 'unknown' && !clientIP.startsWith('127.') && !clientIP.startsWith('192.168.')) {
      try {
        const geoResponse = await fetch(`http://ip-api.com/json/${clientIP}?fields=status,country,countryCode,region,regionName,city,lat,lon,query`);
        const geoResult = await geoResponse.json();
        
        if (geoResult.status === 'success') {
          geoData = {
            country: geoResult.country,
            country_code: geoResult.countryCode,
            region: geoResult.regionName,
            region_code: geoResult.region,
            city: geoResult.city,
            latitude: geoResult.lat,
            longitude: geoResult.lon,
            ip: geoResult.query
          };
        }
      } catch (error) {
        console.error('Error getting geo data:', error);
      }
    }

    // Controllo per evitare visite duplicate dello stesso IP nella stessa sessione (30 minuti)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    
    const { data: recentVisit, error: checkError } = await supabase
      .from('website_visits')
      .select('id')
      .eq('ip_address', clientIP)
      .gte('visit_time', thirtyMinutesAgo)
      .limit(1);

    if (checkError) {
      console.error('Error checking recent visits:', checkError);
    } else if (recentVisit && recentVisit.length > 0) {
      // Visita già tracciata negli ultimi 30 minuti per questo IP
      console.log('🔄 Visit already tracked for IP:', clientIP, 'in last 30 minutes');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Visit already tracked in session',
          duplicate: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save visit to database
    const { data, error } = await supabase
      .from('website_visits')
      .insert({
        page,
        referrer: referrer || null,
        user_agent: userAgent || null,
        ip_address: clientIP,
        country: geoData?.country || null,
        country_code: geoData?.country_code || null,
        region: geoData?.region || null,
        city: geoData?.city || null,
        latitude: geoData?.latitude || null,
        longitude: geoData?.longitude || null,
        visit_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        visit_time: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving visit:', error);
      throw error;
    }

    console.log('✅ Visit tracked successfully:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Visit tracked successfully',
        geoData: geoData ? {
          country: geoData.country,
          city: geoData.city
        } : null
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in track-visit function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});