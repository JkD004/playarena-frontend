// src/app/owner/venues/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, Save, UploadCloud, Trash2, Clock, 
  MapPin, DollarSign, Layout, Image as ImageIcon, Loader2 
} from 'lucide-react';

// Interface for Photos
interface VenuePhoto {
  id: number;
  image_url: string;
}

// Interface for Details
interface VenueDetails {
  name: string;
  sport_category: string;
  description: string;
  address: string;
  price_per_hour: number;
  opening_time: string;
  closing_time: string;
  lunch_start_time: string;
  lunch_end_time: string;
}

export default function EditVenuePage() {
  const params = useParams();
  const router = useRouter();
  const venueId = params.id as string;
  const { token } = useAuth();
  
  // State
  const [photos, setPhotos] = useState<VenuePhoto[]>([]);
  const [formData, setFormData] = useState<VenueDetails>({
    name: '',
    sport_category: 'Football',
    description: '',
    address: '',
    price_per_hour: 0,
    opening_time: '06:00',
    closing_time: '23:00',
    lunch_start_time: '',
    lunch_end_time: '',
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // --- 1. Fetch Data (Photos + Details) ---
  useEffect(() => {
    if (!venueId || !token) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [photosRes, detailsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${venueId}/photos`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${venueId}`, {
             headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (photosRes.ok) setPhotos(await photosRes.json());
        
        if (detailsRes.ok) {
          const data = await detailsRes.json();
          setFormData({
            name: data.name,
            sport_category: data.sport_category,
            description: data.description,
            address: data.address,
            price_per_hour: data.price_per_hour,
            opening_time: data.opening_time || '06:00',
            closing_time: data.closing_time || '23:00',
            lunch_start_time: data.lunch_start_time || '',
            lunch_end_time: data.lunch_end_time || '',
          });
        } else {
            toast.error("Failed to load venue details");
        }
      } catch (err) {
        console.error(err);
        toast.error("Connection error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [venueId, token]);

  // --- 2. Update Venue Details ---
  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${venueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('Venue updated successfully!');
        router.refresh();
      } else {
        throw new Error('Update failed');
      }
    } catch (err) {
      toast.error('Error updating details');
    } finally {
      setIsSaving(false);
    }
  };

  // --- 3. Handle New Photo Upload ---
  const handlePhotoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !token) return;

    const fd = new FormData();
    fd.append('image', imageFile);

    setIsUploading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${venueId}/photos`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd,
      });

      if (res.ok) {
        toast.success('Photo uploaded!');
        setImageFile(null);
        // Refresh photos
        const newPhotosRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${venueId}/photos`);
        setPhotos(await newPhotosRes.json());
      } else {
        toast.error('Upload failed');
      }
    } catch (err) {
      toast.error('Error uploading photo');
    } finally {
      setIsUploading(false);
    }
  };

  // --- 4. Handle Photo Deletion ---
  const handleDeletePhoto = async (photoId: number) => {
    if (!confirm('Are you sure you want to delete this photo?') || !token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/photos/${photoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
         toast.success("Photo deleted");
         setPhotos(prev => prev.filter(p => p.id !== photoId));
      } else {
         toast.error("Failed to delete");
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // Helper for inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const val =
      e.target.name === 'price_per_hour'
        ? parseFloat(e.target.value)
        : e.target.value;
    setFormData({ ...formData, [e.target.name]: val });
  };

  if (isLoading) {
      return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-teal-600"><Loader2 className="w-10 h-10 animate-spin"/></div>
  }

  return (
    <ProtectedRoute allowedRoles={['owner', 'admin']}>
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <Link href="/owner/dashboard" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors text-gray-500 hover:text-teal-600">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manage Venue</h1>
                    <p className="text-sm text-gray-500">Update details and gallery for {formData.name}</p>
                </div>
            </div>
            <Link 
                href={`/owner/venues/${venueId}/dashboard`} 
                className="hidden sm:inline-flex items-center px-4 py-2 bg-teal-50 text-teal-700 rounded-lg font-bold hover:bg-teal-100 transition-colors"
            >
                View Stats
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN — EDIT DETAILS (2/3 Width) */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center">
                            <Layout className="w-5 h-5 mr-2 text-teal-600"/> Venue Details
                        </h2>
                    </div>
                    
                    <div className="p-6 md:p-8">
                        <form onSubmit={handleUpdateDetails} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Venue Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-900 font-medium" required />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                                    <div className="relative">
                                        <select name="sport_category" value={formData.sport_category} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-900 font-medium appearance-none">
                                            <option value="Football">Football</option>
                                            <option value="Cricket">Cricket</option>
                                            <option value="Badminton">Badminton</option>
                                            <option value="Tennis">Tennis</option>
                                            <option value="Swimming">Swimming</option>
                                            <option value="Basketball">Basketball</option>
                                            <option value="Snooker">Snooker</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-900 h-32 resize-none" placeholder="Describe your venue..." />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center"><MapPin className="w-3 h-3 mr-1"/> Address</label>
                                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-900" required />
                            </div>

                            {/* Time & Price Section */}
                            <div className="bg-teal-50/50 p-6 rounded-xl border border-teal-100">
                                <h3 className="text-sm font-bold text-teal-800 mb-4 flex items-center"><Clock className="w-4 h-4 mr-2"/> Operational Hours & Pricing</h3>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Opening</label>
                                        <input type="time" name="opening_time" value={formData.opening_time} onChange={handleChange} className="w-full p-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Closing</label>
                                        <input type="time" name="closing_time" value={formData.closing_time} onChange={handleChange} className="w-full p-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Lunch Start</label>
                                        <input type="time" name="lunch_start_time" value={formData.lunch_start_time} onChange={handleChange} className="w-full p-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Lunch End</label>
                                        <input type="time" name="lunch_end_time" value={formData.lunch_end_time} onChange={handleChange} className="w-full p-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 outline-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center"><DollarSign className="w-3 h-3 mr-1"/> Price Per Hour (₹)</label>
                                    <input type="number" name="price_per_hour" value={formData.price_per_hour} onChange={handleChange} className="w-full p-2 bg-white border border-gray-200 rounded-lg text-gray-900 font-bold focus:ring-2 focus:ring-teal-500 outline-none" required />
                                </div>
                            </div>

                            <button type="submit" disabled={isSaving} className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-500/30 hover:bg-teal-700 hover:shadow-teal-500/40 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-wait">
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : <Save className="w-5 h-5 mr-2"/>}
                                {isSaving ? 'Saving Changes...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN — PHOTOS (1/3 Width) */}
            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center">
                            <ImageIcon className="w-5 h-5 mr-2 text-teal-600"/> Media Gallery
                        </h2>
                    </div>

                    <div className="p-6">
                        {/* Upload Zone */}
                        <form onSubmit={handlePhotoUpload} className="mb-8">
                            <label 
                                htmlFor="file-upload" 
                                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors ${imageFile ? 'border-teal-500 bg-teal-50' : 'border-gray-300'}`}
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadCloud className={`w-8 h-8 mb-2 ${imageFile ? 'text-teal-600' : 'text-gray-400'}`} />
                                    <p className="text-sm text-gray-500 font-medium">
                                        {imageFile ? imageFile.name : "Click to upload image"}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">JPG, PNG (Max 5MB)</p>
                                </div>
                                <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && setImageFile(e.target.files[0])} />
                            </label>
                            
                            {imageFile && (
                                <button 
                                    type="submit" 
                                    disabled={isUploading}
                                    className="mt-3 w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-colors flex items-center justify-center"
                                >
                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : 'Upload Now'}
                                </button>
                            )}
                        </form>

                        {/* Photo Grid */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Existing Photos ({photos.length})</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {photos.map(photo => (
                                    <div key={photo.id} className="relative group rounded-lg overflow-hidden shadow-sm aspect-square bg-gray-100">
                                        <img src={photo.image_url} alt="Venue" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                onClick={() => handleDeletePhoto(photo.id)}
                                                className="bg-white text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors shadow-lg"
                                                title="Delete Photo"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {photos.length === 0 && (
                                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                    <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2"/>
                                    <p className="text-sm text-gray-400">No photos uploaded yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}