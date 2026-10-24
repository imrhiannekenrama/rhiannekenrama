'use client';
import {useState} from 'react';
import {Share2,Check} from 'lucide-react';
export function CopyLink({url}:{url?:string}){const [copied,setCopied]=useState(false);return <button className="button-outline" onClick={async()=>{try{await navigator.clipboard.writeText(url||location.href);setCopied(true);setTimeout(()=>setCopied(false),1800)}catch{setCopied(false)}}}>{copied?<Check size={16}/>:<Share2 size={16}/>} {copied?'Copied':'Copy link'}</button>}
