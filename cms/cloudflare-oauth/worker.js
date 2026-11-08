// MS EMotion Cars — Decap CMS GitHub OAuth bridge (Cloudflare Worker).
// Deploy ONLY to ms-emotion-cms-auth.bwalser13.workers.dev.
// Requires secrets: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET.
// The existing Astro website and GitHub Pages are not changed by this Worker.
const WORKER_ORIGIN = 'https://ms-emotion-cms-auth.bwalser13.workers.dev';
const CMS_ORIGIN = 'https://bernik-13.github.io';
const CMS_PATH = '/ms-emotion-cars/admin/';
const ALLOWED_LOGIN = 'bernik-13';
const COOKIE = 'ms_cms_oauth_state';
const headers = {'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
function reply(message,status=400){return new Response(message,{status,headers:{...headers,'Content-Type':'text/plain; charset=utf-8'}});}
function randomString(){const b=crypto.getRandomValues(new Uint8Array(32));return Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');}
function getCookie(req,key){const s=req.headers.get('Cookie')||'';return s.split(';').map(x=>x.trim()).find(x=>x.startsWith(key+'='))?.slice(key.length+1)||'';}
function cookie(value,maxAge){return `${COOKIE}=${value}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;}
function callbackHtml(payload){
  // Serialize with HTML-sensitive characters escaped to prevent script injection.
  const json=JSON.stringify(payload).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
  const origin=JSON.stringify(CMS_ORIGIN);
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="referrer" content="no-referrer"><title>MS EMotion Cars CMS</title></head><body><p>Anmeldung wird abgeschlossen …</p><script>
    const payload=${json};
    const origin=${origin};
    if(window.opener){
      window.opener.postMessage('authorizing:github',origin);
      window.addEventListener('message',function handler(e){
        if(e.origin!==origin || e.source!==window.opener || e.data!=='authorization:github')return;
        window.removeEventListener('message',handler);
        window.opener.postMessage('authorization:github:'+payload.status+':'+JSON.stringify(payload.data),origin);
        window.close();
      });
    }else{document.body.textContent='Bitte die Anmeldung über den CMS-Login starten.';}
  <\/script></body></html>`;
}
function htmlResponse(payload,clearCookie=true){
  return new Response(callbackHtml(payload),{headers:{...headers,'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':`default-src 'none'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`,...(clearCookie?{'Set-Cookie':cookie('',0)}:{})}});
}
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(url.origin!==WORKER_ORIGIN)return reply('Unknown host',403);
  if(!env.GITHUB_CLIENT_ID||!env.GITHUB_CLIENT_SECRET)return reply('OAuth credentials missing',503);
  if(request.method!=='GET')return reply('Method not allowed',405);
  if(url.pathname==='/')return reply('CMS OAuth service ready',200);
  if(url.pathname==='/auth'){
    const state=randomString();
    const github=new URL('https://github.com/login/oauth/authorize');
    github.searchParams.set('client_id',env.GITHUB_CLIENT_ID);
    github.searchParams.set('redirect_uri',WORKER_ORIGIN+'/callback');
    github.searchParams.set('scope','public_repo');
    github.searchParams.set('state',state);
    return new Response(null,{status:302,headers:{...headers,'Location':github.toString(),'Set-Cookie':cookie(state,600)}});
  }
  if(url.pathname==='/callback'){
    const state=url.searchParams.get('state')||'';
    const saved=getCookie(request,COOKIE);
    if(!saved||!state||saved!==state)return reply('Invalid or expired OAuth state. Please restart login.',403);
    if(url.searchParams.has('error'))return htmlResponse({status:'error',data:{message:'GitHub authorization declined'}});
    const code=url.searchParams.get('code');
    if(!code)return reply('Missing authorization code',400);
    try{
      const exchange=await fetch('https://github.com/login/oauth/access_token',{method:'POST',headers:{'Accept':'application/json','Content-Type':'application/json'},body:JSON.stringify({client_id:env.GITHUB_CLIENT_ID,client_secret:env.GITHUB_CLIENT_SECRET,code,redirect_uri:WORKER_ORIGIN+'/callback'})});
      if(!exchange.ok)throw Error('Token exchange failed');
      const tokenData=await exchange.json();
      if(!tokenData.access_token)throw Error('No token returned');
      const profile=await fetch('https://api.github.com/user',{headers:{'Authorization':'Bearer '+tokenData.access_token,'Accept':'application/vnd.github+json','User-Agent':'ms-emotion-cms-auth'}});
      if(!profile.ok)throw Error('GitHub user verification failed');
      const user=await profile.json();
      if(String(user.login||'').toLowerCase()!==ALLOWED_LOGIN)return htmlResponse({status:'error',data:{message:'This GitHub account is not authorized for this CMS'}});
      return htmlResponse({status:'success',data:{token:tokenData.access_token,provider:'github'}});
    }catch(e){return htmlResponse({status:'error',data:{message:'GitHub login could not be completed'}});}
  }
  return reply('Not found',404);
 }
};
