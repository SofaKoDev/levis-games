// Read-only connection check. No generation, account changes, or paid endpoints.
const key=process.env.ELEVENLABS_API_KEY;
if(!key){console.error('No ElevenLabs key configured. Add it locally to sound-lab/.env.local.');process.exitCode=1;}
else {
  async function read(path){const response=await fetch(`https://api.elevenlabs.io${path}`,{headers:{'xi-api-key':key}});if(!response.ok)throw new Error(`Read-only connection check failed (${response.status}) for ${path}. Check key permissions; no audio was generated.`);return response.json();}
  try{
    const subscription=await read('/v1/user/subscription');
    console.log(JSON.stringify({tier:subscription.tier,characterCount:subscription.character_count,characterLimit:subscription.character_limit,usageBasedBilling:subscription.can_extend_character_limit},null,2));
    const result=await read('/v2/voices?page_size=100');
    const candidates=(result.voices||[]).filter(v=>/american/i.test(v.labels?.accent||'')).map(v=>({id:v.voice_id,name:v.name,category:v.category,labels:v.labels}));
    console.log(JSON.stringify({americanVoiceCandidates:candidates},null,2));
    const models=await read('/v1/models');
    console.log(JSON.stringify({speechModels:models.filter(m=>m.can_do_text_to_speech).map(m=>({id:m.model_id,name:m.name}))},null,2));
  }catch(error){console.error(error.message);process.exitCode=1;}
}
