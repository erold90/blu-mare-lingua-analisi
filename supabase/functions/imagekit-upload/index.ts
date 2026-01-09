import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import ImageKit from "npm:imagekit@4.1.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize ImageKit with environment variables
const imagekit = new ImageKit({
  publicKey: Deno.env.get('IMAGEKIT_PUBLIC_KEY') || '',
  privateKey: Deno.env.get('IMAGEKIT_PRIVATE_KEY') || '',
  urlEndpoint: Deno.env.get('IMAGEKIT_URL_ENDPOINT') || ''
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace('/imagekit-upload', '');

    // GET /auth - Get authentication parameters for client-side upload
    if (req.method === 'GET' && path === '/auth') {
      const authParams = imagekit.getAuthenticationParameters();
      return new Response(JSON.stringify(authParams), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST /upload - Upload image
    if (req.method === 'POST' && path === '/upload') {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const fileName = formData.get('fileName') as string || file.name;
      const folder = formData.get('folder') as string || '/villa-mareblu';

      if (!file) {
        return new Response(JSON.stringify({ error: 'No file provided' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      // Upload to ImageKit
      const result = await imagekit.upload({
        file: base64,
        fileName: fileName,
        folder: folder,
        useUniqueFileName: true,
        tags: ['villa-mareblu']
      });

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // DELETE /delete/:fileId - Delete image
    if (req.method === 'DELETE' && path.startsWith('/delete/')) {
      const fileId = path.replace('/delete/', '');

      if (!fileId) {
        return new Response(JSON.stringify({ error: 'No fileId provided' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      await imagekit.deleteFile(fileId);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // GET /list - List images in a folder
    if (req.method === 'GET' && path === '/list') {
      const folder = url.searchParams.get('folder') || '/villa-mareblu';

      const files = await imagekit.listFiles({
        path: folder,
        limit: 100
      });

      return new Response(JSON.stringify(files), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('ImageKit function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
