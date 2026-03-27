/* Debug endpoint — test blob storage directly */
import { put, list } from '@vercel/blob';

export async function GET(request) {
  const results = { tokenExists: false, writeTest: null, listTest: null, errors: [] };
  
  // Check if token exists
  results.tokenExists = !!process.env.BLOB_READ_WRITE_TOKEN;
  results.tokenPrefix = process.env.BLOB_READ_WRITE_TOKEN ? process.env.BLOB_READ_WRITE_TOKEN.substring(0, 12) + '...' : 'MISSING';
  
  // Try to write
  try {
    const blob = await put('test/ping.json', JSON.stringify({ t: Date.now() }), { 
      access: 'public', 
      addRandomSuffix: false,
      contentType: 'application/json'
    });
    results.writeTest = { success: true, url: blob.url };
  } catch (e) {
    results.writeTest = { success: false, error: e.message };
    results.errors.push('write: ' + e.message);
  }
  
  // Try to list
  try {
    const { blobs } = await list();
    results.listTest = { success: true, count: blobs.length, blobs: blobs.map(b => b.pathname) };
  } catch (e) {
    results.listTest = { success: false, error: e.message };
    results.errors.push('list: ' + e.message);
  }
  
  return Response.json(results);
}
