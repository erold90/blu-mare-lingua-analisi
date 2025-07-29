import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsParams {
  period: 'daily' | 'monthly' | 'yearly';
  startDate?: string;
  endDate?: string;
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

    const { period, startDate, endDate }: AnalyticsParams = await req.json();

    // Build date filter
    let dateFilter = '';
    const now = new Date();
    
    switch (period) {
      case 'daily':
        const today = now.toISOString().split('T')[0];
        dateFilter = `visit_date = '${today}'`;
        break;
      case 'monthly':
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        dateFilter = `visit_date >= '${firstDayOfMonth}' AND visit_date <= '${lastDayOfMonth}'`;
        break;
      case 'yearly':
        const firstDayOfYear = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        const lastDayOfYear = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
        dateFilter = `visit_date >= '${firstDayOfYear}' AND visit_date <= '${lastDayOfYear}'`;
        break;
    }

    // Custom date range
    if (startDate && endDate) {
      dateFilter = `visit_date >= '${startDate}' AND visit_date <= '${endDate}'`;
    }

    // Get total visits
    const { data: totalVisits, error: totalError } = await supabase
      .from('website_visits')
      .select('id', { count: 'exact' })
      .gte('visit_date', startDate || (period === 'yearly' ? `${now.getFullYear()}-01-01` : 
                                      period === 'monthly' ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01` : 
                                      now.toISOString().split('T')[0]))
      .lte('visit_date', endDate || now.toISOString().split('T')[0]);

    if (totalError) throw totalError;

    // Get visits by country
    const { data: visitsByCountry, error: countryError } = await supabase
      .from('website_visits')
      .select('country, country_code, latitude, longitude')
      .not('country', 'is', null)
      .gte('visit_date', startDate || (period === 'yearly' ? `${now.getFullYear()}-01-01` : 
                                      period === 'monthly' ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01` : 
                                      now.toISOString().split('T')[0]))
      .lte('visit_date', endDate || now.toISOString().split('T')[0]);

    if (countryError) throw countryError;

    // Group by country
    const countryStats = visitsByCountry?.reduce((acc: any, visit) => {
      const country = visit.country;
      if (!acc[country]) {
        acc[country] = {
          country: visit.country,
          country_code: visit.country_code,
          latitude: visit.latitude,
          longitude: visit.longitude,
          count: 0
        };
      }
      acc[country].count++;
      return acc;
    }, {});

    const countryList = Object.values(countryStats || {}).sort((a: any, b: any) => b.count - a.count);

    // Get visits timeline (last 30 days)
    const { data: timeline, error: timelineError } = await supabase
      .from('website_visits')
      .select('visit_date')
      .gte('visit_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('visit_date', { ascending: true });

    if (timelineError) throw timelineError;

    // Group timeline by date
    const timelineStats = timeline?.reduce((acc: any, visit) => {
      const date = visit.visit_date;
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const timelineArray = Object.entries(timelineStats || {}).map(([date, count]) => ({
      date,
      visits: count
    }));

    console.log('📊 Analytics data prepared:', {
      totalVisits: totalVisits?.length || 0,
      countries: countryList.length,
      period
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          totalVisits: totalVisits?.length || 0,
          visitsByCountry: countryList,
          timeline: timelineArray,
          period,
          dateRange: {
            start: startDate || (period === 'yearly' ? `${now.getFullYear()}-01-01` : 
                                period === 'monthly' ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01` : 
                                now.toISOString().split('T')[0]),
            end: endDate || now.toISOString().split('T')[0]
          }
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in get-visit-analytics function:', error);
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