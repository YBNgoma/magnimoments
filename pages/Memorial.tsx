import React, { useEffect, useState } from 'react';
import { User, MemorialWithRole, Photo, Role } from '../types';
import { getMemorialById, getPhotos, addPhoto, updateMemorialBio, inviteContributor } from '../services/mockBackend';
import { generateBio, analyzePhoto } from '../services/geminiService';
import { Camera, Sparkles, Upload, Users, X, Edit3, Save, Quote, ChevronLeft, ArrowUpRight } from 'lucide-react';

interface MemorialProps {
  user: User;
  memorialId: string;
  onBack: () => void;
}

export const MemorialPage: React.FC<MemorialProps> = ({ user, memorialId, onBack }) => {
  const [memorial, setMemorial] = useState<MemorialWithRole | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showUpload, setShowUpload] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showBioEdit, setShowBioEdit] = useState(false);
  
  // Bio Edit State
  const [editingBio, setEditingBio] = useState('');
  const [geminiBioPrompt, setGeminiBioPrompt] = useState('');
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

  // Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoTags, setPhotoTags] = useState<string[]>([]);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Invite State
  const [inviteEmail, setInviteEmail] = useState('');

  // Scroll effect state
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    loadData();
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [memorialId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const mem = await getMemorialById(memorialId, user);
      if (mem) {
        setMemorial(mem);
        setEditingBio(mem.bio);
        const p = await getPhotos(memorialId, user);
        setPhotos(p);
      }
    } catch (e) {
      console.error(e);
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memorial) return;
    try {
      await inviteContributor(memorial.id, inviteEmail, user);
      setShowInvite(false);
      setInviteEmail('');
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleBioSave = async () => {
    if (!memorial) return;
    await updateMemorialBio(memorial.id, editingBio, user);
    setMemorial({ ...memorial, bio: editingBio });
    setShowBioEdit(false);
  };

  const handleGeminiBio = async () => {
    if (!memorial) return;
    setIsGeneratingBio(true);
    const facts = geminiBioPrompt || "loved family and nature";
    const dates = `${new Date(memorial.birthDate).getFullYear()} - ${new Date(memorial.deathDate).getFullYear()}`;
    const generated = await generateBio(memorial.fullName, dates, facts, 'warm');
    setEditingBio(generated);
    setIsGeneratingBio(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      setPreviewUrl(base64);
      
      // Auto-analyze with Gemini
      setIsAnalyzingPhoto(true);
      const analysis = await analyzePhoto(base64.split(',')[1]);
      setPhotoCaption(analysis.caption);
      setPhotoTags(analysis.tags);
      setIsAnalyzingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async () => {
    if (!memorial || !previewUrl) return;
    
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const duration = 2000;
    const intervalTime = 50;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const progressInterval = setInterval(() => {
      currentStep++;
      const percent = Math.min(Math.round((currentStep / steps) * 95), 95);
      setUploadProgress(percent);
    }, intervalTime);

    await new Promise(resolve => setTimeout(resolve, duration));
    
    clearInterval(progressInterval);
    setUploadProgress(100);

    await addPhoto(memorial.id, previewUrl, photoCaption, photoTags, user);
    setPhotos(await getPhotos(memorial.id, user));
    
    await new Promise(resolve => setTimeout(resolve, 500));

    setShowUpload(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setPhotoCaption('');
    setPhotoTags([]);
    setIsUploading(false);
    setUploadProgress(0);
  };

  if (loading || !memorial) return <div className="h-screen flex items-center justify-center text-stone-400 font-serif text-xl animate-pulse">Loading Memorial...</div>;

  const canEdit = memorial.currentUserRole === Role.OWNER || memorial.currentUserRole === Role.SUPER_ADMIN;

  return (
    <div className="bg-[#FBFBF9] min-h-screen">
      {/* Immersive Hero Section */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-stone-900">
           <img src={memorial.coverPhotoUrl} className="w-full h-full object-cover opacity-90 scale-105 animate-pulse-slow" alt="Cover" />
        </div>
        
        {/* Gradients for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#FBFBF9] via-transparent to-transparent h-64 bottom-0 top-auto"></div>

        {/* Floating Back Button */}
        <button 
          onClick={onBack} 
          className="absolute top-8 left-8 z-50 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md transition-all duration-300 group"
        >
          <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="max-w-4xl px-6 animate-fade-in-up">
            <h1 className="font-serif text-6xl md:text-8xl text-white mb-6 tracking-tight drop-shadow-lg leading-none">
              {memorial.fullName}
            </h1>
            <div className="inline-flex items-center gap-4 text-gold-200/90 text-xl md:text-2xl font-light tracking-widest uppercase border-y border-gold-200/30 py-3 px-8 backdrop-blur-sm">
               <span>{new Date(memorial.birthDate).getFullYear()}</span>
               <span className="text-[10px] opacity-60">●</span>
               <span>{new Date(memorial.deathDate).getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-32 relative z-10 pb-32">
        {/* Floating Action Bar */}
        <div className={`sticky top-6 z-40 transition-all duration-500 mb-20 ${scrolled ? 'translate-y-0' : 'translate-y-4'}`}>
           <div className="bg-white/80 backdrop-blur-xl rounded-full shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] p-2 pr-6 flex items-center justify-between max-w-2xl mx-auto border border-white/50">
             <div className="flex items-center gap-2">
               <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-full hover:bg-black transition-all shadow-md group">
                 <Camera size={18} /> <span className="font-medium">Contribute</span>
               </button>
               {canEdit && (
                 <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 px-5 py-3 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-all">
                   <Users size={18} /> <span className="hidden sm:inline">Invite Family</span>
                 </button>
               )}
             </div>
             <div className="text-xs font-semibold uppercase tracking-widest text-stone-400 pl-4 border-l border-stone-200 hidden sm:block">
               {memorial.slug.replace('-', ' ')}
             </div>
           </div>
        </div>

        {/* Biography Section */}
        <div className="max-w-3xl mx-auto text-center mb-32 animate-fade-in">
          <div className="mb-8 flex justify-center text-gold-400 opacity-60">
             <Quote size={40} fill="currentColor" />
          </div>
          <div className="relative group cursor-default">
             <p className="font-serif text-2xl md:text-3xl leading-relaxed text-stone-800 text-opacity-90">
               {memorial.bio}
             </p>
             {canEdit && (
               <button 
                 onClick={() => setShowBioEdit(true)} 
                 className="absolute -right-12 top-0 text-stone-300 hover:text-stone-600 opacity-0 group-hover:opacity-100 transition-all duration-300 p-2"
                 title="Edit Biography"
               >
                 <Edit3 size={18} />
               </button>
             )}
          </div>
          <div className="mt-8 h-1 w-24 bg-gold-200 mx-auto rounded-full"></div>
        </div>

        {/* Masonry Gallery */}
        <div className="mb-12 flex items-baseline justify-between border-b border-stone-200 pb-4">
           <h2 className="font-serif text-4xl text-stone-900">Gallery</h2>
           <span className="text-stone-500 font-sans text-sm">{photos.length} memories shared</span>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {photos.map((photo, idx) => (
            <div 
              key={photo.id} 
              className="break-inside-avoid relative group rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 bg-stone-900 cursor-zoom-in opacity-0 animate-scale-up"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <img 
                src={photo.url} 
                alt="Memory" 
                className="w-full h-auto opacity-95 group-hover:opacity-100 group-hover:scale-105 transition-transform duration-700 ease-in-out" 
              />
              
              {/* Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                <p className="text-white font-serif text-xl italic mb-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                  "{photo.caption}"
                </p>
                <div className="flex flex-wrap gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75 ease-out">
                  {photo.tags?.map((tag, i) => (
                    <span key={i} className="text-[10px] uppercase font-bold tracking-widest bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full border border-white/10">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {photos.length === 0 && (
          <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-stone-200">
            <Camera size={48} className="mx-auto text-stone-300 mb-4" />
            <p className="text-stone-400 font-serif text-xl">This gallery is empty.</p>
            <p className="text-stone-500 text-sm mt-2">Be the first to share a memory.</p>
          </div>
        )}
      </div>

      {/* Edit Bio Modal */}
      {showBioEdit && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl p-8 animate-scale-up">
            <div className="flex justify-between items-center mb-6">
               <h2 className="font-serif text-3xl text-stone-900">Edit Biography</h2>
               <button onClick={() => setShowBioEdit(false)} className="text-stone-400 hover:text-stone-900"><X size={24}/></button>
            </div>
            
            {/* AI Assistant */}
            <div className="bg-gradient-to-r from-gold-50 to-white p-5 rounded-2xl mb-6 border border-gold-100">
              <h3 className="text-gold-700 font-bold text-xs uppercase tracking-wider flex items-center gap-2 mb-3">
                <Sparkles size={14} /> AI Writing Assistant
              </h3>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={geminiBioPrompt}
                  onChange={(e) => setGeminiBioPrompt(e.target.value)}
                  placeholder="Facts: loved sailing, born in Ohio, kind soul..."
                  className="flex-grow border-0 bg-white shadow-sm rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-gold-200"
                />
                <button 
                  onClick={handleGeminiBio}
                  disabled={isGeneratingBio}
                  className="bg-gold-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-gold-600 disabled:opacity-50 font-medium transition-colors shadow-lg shadow-gold-500/20"
                >
                  {isGeneratingBio ? 'Writing...' : 'Generate Bio'}
                </button>
              </div>
            </div>

            <textarea 
              value={editingBio}
              onChange={(e) => setEditingBio(e.target.value)}
              className="w-full h-64 bg-stone-50 border-0 rounded-2xl p-6 font-serif text-lg leading-relaxed focus:ring-2 focus:ring-stone-200 outline-none resize-none"
            />
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowBioEdit(false)} className="px-5 py-2.5 text-stone-500 hover:bg-stone-50 rounded-xl transition-colors font-medium">Cancel</button>
              <button onClick={handleBioSave} className="px-6 py-2.5 bg-stone-900 text-white rounded-xl flex items-center gap-2 hover:bg-black transition-colors shadow-lg">
                <Save size={16} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal - Modernized */}
      {showUpload && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl p-8 animate-scale-up relative overflow-hidden">
            <h2 className="font-serif text-3xl mb-6 text-stone-900">Share a Memory</h2>
            
            {!previewUrl ? (
              <label className="group border-2 border-dashed border-stone-200 rounded-2xl h-64 flex flex-col items-center justify-center text-stone-400 hover:text-stone-600 hover:border-stone-400 hover:bg-stone-50 transition-all cursor-pointer relative">
                <input type="file" onChange={handleFileSelect} className="hidden" accept="image/*" />
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                   <Upload size={24} className="text-stone-500" />
                </div>
                <p className="font-medium">Click to upload photo</p>
                <p className="text-xs text-stone-400 mt-1">JPG, PNG up to 10MB</p>
              </label>
            ) : (
              <div className="space-y-6">
                <div className="relative h-56 bg-stone-100 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                  <img src={previewUrl} className="max-h-full max-w-full object-contain" alt="Preview" />
                  {isAnalyzingPhoto && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center text-stone-600">
                      <Sparkles size={24} className="text-gold-500 animate-spin mb-2" /> 
                      <span className="font-medium text-sm">Analyzing image details...</span>
                    </div>
                  )}
                  <button onClick={() => setPreviewUrl(null)} disabled={isUploading} className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md">
                    <X size={16} />
                  </button>
                </div>
                
                <div className="grid gap-5">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                       <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Caption</label>
                       {!isAnalyzingPhoto && photoCaption && <span className="text-[10px] text-gold-600 flex items-center gap-1"><Sparkles size={8}/> AI Generated</span>}
                    </div>
                    <input 
                      type="text" 
                      value={photoCaption} 
                      onChange={e => setPhotoCaption(e.target.value)}
                      className="w-full bg-stone-50 border-0 p-3 rounded-xl focus:ring-2 focus:ring-stone-200 disabled:opacity-60 font-serif text-lg"
                      placeholder="Describe this moment..."
                      disabled={isUploading}
                    />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Tags</label>
                     <div className="flex flex-wrap gap-2 mb-3 min-h-[30px]">
                       {photoTags.map((tag, i) => (
                         <span key={i} className="bg-stone-100 px-3 py-1 rounded-full text-xs font-medium text-stone-600 flex items-center gap-1 border border-stone-200">
                           #{tag} <button onClick={() => setPhotoTags(photoTags.filter(t => t !== tag))} className="hover:text-red-500" disabled={isUploading}><X size={12}/></button>
                         </span>
                       ))}
                     </div>
                     <input 
                       type="text" 
                       placeholder="Type tag and press Enter"
                       disabled={isUploading}
                       onKeyDown={(e) => {
                         if(e.key === 'Enter') {
                           e.preventDefault();
                           const val = (e.target as HTMLInputElement).value;
                           if(val) {
                             setPhotoTags([...photoTags, val]);
                             (e.target as HTMLInputElement).value = '';
                           }
                         }
                       }}
                       className="w-full bg-stone-50 border-0 p-3 rounded-xl text-sm focus:ring-2 focus:ring-stone-200"
                     />
                  </div>
                </div>

                {isUploading && (
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                    <div className="flex justify-between text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">
                      <span>Uploading Memory...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-stone-900 h-1.5 rounded-full transition-all duration-200 ease-out" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => { setShowUpload(false); setPreviewUrl(null); }} 
                    disabled={isUploading}
                    className="flex-1 py-3 text-stone-500 hover:bg-stone-50 rounded-xl transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUploadSubmit} 
                    disabled={isUploading || isAnalyzingPhoto}
                    className="flex-[2] py-3 bg-stone-900 text-white rounded-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:bg-black transition-all shadow-lg hover:shadow-xl"
                  >
                    {isUploading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <ArrowUpRight size={18} />} 
                    {isUploading ? 'Uploading...' : 'Post Memory'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 animate-scale-up">
            <h2 className="font-serif text-2xl mb-2 text-stone-900">Invite Family</h2>
            <p className="text-stone-500 mb-6 text-sm font-light">Grant access to contribute to this memorial page.</p>
            <form onSubmit={handleInvite}>
              <div className="mb-6">
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="w-full bg-stone-50 border-0 p-4 rounded-xl focus:ring-2 focus:ring-stone-200 transition-all"
                  placeholder="family.member@email.com"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowInvite(false)} className="px-5 py-2.5 text-stone-500 hover:bg-stone-50 rounded-xl transition-colors font-medium">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-stone-900 text-white rounded-xl hover:bg-black transition-colors shadow-lg">Send Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};