import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ApiClient } from '../src/client.js';

test('reads authorized JSON with injected transport', async () => {
  const client = new ApiClient({baseUrl:'https://example.test/',token:'mock',fetchImpl:async (url, options) => {
    assert.equal(url.href,'https://example.test/profile');
    assert.equal(options.headers.Authorization,'Bearer mock');
    assert.equal(options.redirect,'error');
    return Response.json({id:'fixture'});
  }});
  assert.deepEqual(await client.get('/profile'),{id:'fixture'});
});

test('blocks cross-origin token exposure', async () => {
  const client = new ApiClient({baseUrl:'https://example.test/',token:'mock',fetchImpl:()=>assert.fail('network called')});
  await assert.rejects(client.get('https://other.test/'), /Cross-origin/);
});

test('rejects HTTP errors without exposing response content', async () => {
  const client = new ApiClient({baseUrl:'https://example.test/',token:'mock',fetchImpl:async()=>new Response('secret',{status:403})});
  await assert.rejects(client.get('/profile'), {message:'API returned HTTP 403'});
});

test('requires HTTPS and token', () => {
  assert.throws(()=>new ApiClient({baseUrl:'http://example.test/',token:'mock'}));
  assert.throws(()=>new ApiClient({baseUrl:'https://example.test/',token:''}));
});
