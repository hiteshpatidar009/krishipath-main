import { ENV } from '../config/env.js';

export async function uploadToImgBB(file) {
  const form = new FormData();
  form.append("image", file);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${ENV.IMGBB_API_KEY}`, {
    method: "POST",
    body: form,
  });

  const data = await res.json();
  return data.data.url; 
}
