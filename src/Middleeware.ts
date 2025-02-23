import { Hono } from 'hono';

export const imagerouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    MY_KV: KVNamespace;
  };
}>();

// Upload file route
imagerouter.post('/upload', async (c) => {
  
  const contentType = c.req.header('Content-Type');
  if (!contentType || !contentType.includes('multipart/form-data')) {
    return c.text('Invalid Content-Type header. Must be multipart/form-data.', 400);
  } 
  

  const formData = await c.req.formData();
  const file = formData.get('file') as File;
  console.log("its here 2");

  if (!file) {
    return c.text('No file uploaded', 400);
  }
  
  // Generate a unique key for the file
  const key = `${Date.now()}-${file.name}`;
  console.log(key)
  

  // Convert the file to an ArrayBuffer
  const buffer = await file.arrayBuffer();

  // Store the file in KV storage
  await c.env.MY_KV.put(key, buffer);

  return c.json({ success: true, key });
});





// Retrieve file route
imagerouter.get('/file/:key', async (c) => {
  const key = c.req.param('key');

  const keys = await c.env.MY_KV.list();
console.log(keys.keys); // This will log all keys stored in the KV store

  // Retrieve the file from KV storage as an ArrayBuffer
  const file = await c.env.MY_KV.get(key, 'arrayBuffer');

  if (!file) {
    return c.text('File not found888888', 408);
  }

  // Convert the ArrayBuffer to a Uint8Array
  const uint8File = new Uint8Array(file as ArrayBuffer);

  // Return the file with appropriate headers
  // @ts-ignore
  return c.body(uint8File, 200, {
    'Content-Type': 'application/octet-stream',
  });
});
