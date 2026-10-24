import {Camera} from 'lucide-react';
export function ProfilePortrait({mediaId,displayName='Rhianne Ken S. Rama',variant='hero'}:{mediaId?:string|null;displayName?:string;variant?:'hero'|'about'}){
 return <div className={`profile-portrait profile-portrait--${variant}`}>
   {mediaId?<img src={`/api/media/${encodeURIComponent(mediaId)}`} alt={`Portrait of ${displayName}`} className="profile-photo" fetchPriority={variant==='hero'?'high':undefined}/>
   :<div className="profile-placeholder" role="img" aria-label="Profile photo not added yet">
      <div className="profile-monogram" aria-hidden>RR</div>
      <span className="profile-placeholder-label"><Camera size={16}/> Portrait coming soon</span>
    </div>}
   <div className="portrait-caption"><span className="portrait-dot"/><span>{displayName}</span><span className="portrait-caption-side">PERSONAL ARCHIVE</span></div>
 </div>;
}
