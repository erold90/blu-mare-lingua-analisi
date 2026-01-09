const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const IMAGEKIT_PRIVATE_KEY = Deno.env.get('IMAGEKIT_PRIVATE_KEY') || '';
const IMAGEKIT_PUBLIC_KEY = Deno.env.get('IMAGEKIT_PUBLIC_KEY') || '';

// Helper to convert ArrayBuffer to hex string
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Generate HMAC-SHA1 signature using Web Crypto API
async function generateSignature(data: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const msgData = encoder.encode(data);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  return bufferToHex(signature);
}

// Generate authentication parameters for client-side upload
async function getAuthenticationParameters() {
  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 3600;
  const signatureString = token + expire;
  const signature = await generateSignature(signatureString, IMAGEKIT_PRIVATE_KEY);

  return {
    token,
    expire,
    signature,
    publicKey: IMAGEKIT_PUBLIC_KEY
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace('/imagekit-upload', '');

    // GET /auth - Get authentication parameters
    if (req.method === 'GET' && (path === '/auth' || path === '')) {
      const authParams = await getAuthenticationParameters();
      return new Response(JSON.stringify(authParams), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST /upload - Upload image to ImageKit
    if (req.method === 'POST' && path === '/upload') {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const fileName = formData.get('fileName') as string || file?.name || 'image.jpg';
      const folder = formData.get('folder') as string || '/villa-mareblu';

      if (!file) {
        return new Response(JSON.stringify({ error: 'No file provided' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      // Upload to ImageKit
      const uploadFormData = new FormData();
      uploadFormData.append('file', base64);
      uploadFormData.append('fileName', fileName);
      uploadFormData.append('folder', folder);
      uploadFormData.append('useUniqueFileName', 'true');

      const authHeader = btoa(`${IMAGEKIT_PRIVATE_KEY}:`);

      const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        headers: { 'Authorization': `Basic ${authHeader}` },
        body: uploadFormData
      });

      const result = await response.json();

      if (!response.ok) {
        return new Response(JSON.stringify({ error: result.message || 'Upload failed' }), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({
        fileId: result.fileId,
        name: result.name,
        filePath: result.filePath,
        url: result.url
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // DELETE /delete/:fileId
    if (req.method === 'DELETE' && path.startsWith('/delete/')) {
      const fileId = path.replace('/delete/', '');
      if (!fileId) {
        return new Response(JSON.stringify({ error: 'No fileId provided' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const authHeader = btoa(`${IMAGEKIT_PRIVATE_KEY}:`);
      const response = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Basic ${authHeader}` }
      });

      if (!response.ok && response.status !== 204) {
        return new Response(JSON.stringify({ error: 'Delete failed' }), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
