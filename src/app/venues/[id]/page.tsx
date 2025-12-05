"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

// Swiper Imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// --- Interfaces ---
interface Venue {
  id: number;
  name: string;
  sport_category: string;
  description: string;
  address: string;
  price_per_hour: number;
  opening_time: string;
  closing_time: string;
  lunch_start_time?: string;
  lunch_end_time?: string;
}

interface VenuePhoto {
  id: number;
  image_url: string;
}

interface BookedSlot {
  start_time: string;
  end_time: string;
}

interface Review {
  id: number;
  user_first_name: string;
  user_last_name: string;
  rating: number;
  comment: string;
  created_at: string;
  reply?: string;        // Owner's reply
  replied_at?: string;   // Date of reply
}

export default function VenueDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { isLoggedIn, token, role } = useAuth(); // Get 'role' to check if owner

  // --- State Variables ---
  const [venue, setVenue] = useState<Venue | null>(null);
  const [photos, setPhotos] = useState<VenuePhoto[]>([]);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  // Review State
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Reply State (Owner)
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  // --- Helpers ---
  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${minutes} ${ampm}`;
  };

  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  };
  const dateOptions = generateDates();

  const generateTimeSlots = () => {
    if (!venue) return [];
    const slots = [];
    const startHour = parseInt(venue.opening_time.split(':')[0]);
    const endHour = parseInt(venue.closing_time.split(':')[0]);

    let lunchStart = -1;
    let lunchEnd = -1;
    if (venue.lunch_start_time && venue.lunch_end_time) {
      lunchStart = parseInt(venue.lunch_start_time.split(':')[0]);
      lunchEnd = parseInt(venue.lunch_end_time.split(':')[0]);
    }

    for (let i = startHour; i < endHour; i++) {
      if (lunchStart !== -1 && i >= lunchStart && i < lunchEnd) continue;
      const hour = i < 10 ? `0${i}` : i;
      slots.push(`${hour}:00`);
    }
    return slots;
  };
  const timeSlots = generateTimeSlots();

  // --- 1. Fetch All Data (Venue, Photos, Reviews) ---
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [venueRes, photosRes, reviewsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${id}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${id}/photos`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${id}/reviews`)
        ]);

        if (venueRes.ok) setVenue(await venueRes.json());

        if (photosRes.ok) {
          const pData = await photosRes.json();
          setPhotos(pData || []); // Handle null response safely
        }

        if (reviewsRes.ok) {
          const rData = await reviewsRes.json();
          setReviews(rData || []); // Handle null response safely
        }

      } catch (err) {
        console.error(err);
        setError("Failed to load venue data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // --- 2. Fetch Booked Slots (When Date Changes) ---
  useEffect(() => {
    if (!id) return;
    const fetchSlots = async () => {
      const dateStr = selectedDate.toISOString().split('T')[0];
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${id}/slots?date=${dateStr}`);
        if (res.ok) {
          const data = await res.json();
          setBookedSlots(data || []);
          setSelectedTime(null);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSlots();
  }, [id, selectedDate]);

  const isSlotBooked = (timeStr: string) => {
    const slotStart = new Date(`${selectedDate.toISOString().split('T')[0]}T${timeStr}:00`);
    return bookedSlots.some(booking => {
      const bookingStart = new Date(booking.start_time);
      const bookingEnd = new Date(booking.end_time);
      return slotStart >= bookingStart && slotStart < bookingEnd;
    });
  };

  const isPastSlot = (timeStr: string) => {
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();

    if (!isToday) return false; // Only apply to today

    const [hour, minute] = timeStr.split(":").map(Number);

    const slotDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      hour,
      minute,
      0
    );

    return slotDate.getTime() <= now.getTime();
  };


  // --- 3. Handle Booking ---
  const handleBooking = async () => {
    if (!isLoggedIn || !token) {
      router.push(`/login?redirect=/venues/${id}`);
      return;
    }
    if (!selectedTime) return;

    setIsBooking(true);
    const dateStr = selectedDate.toISOString().split('T')[0];
    const startDateTime = new Date(`${dateStr}T${selectedTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          venue_id: parseInt(id),
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');

      router.push(`/bookings/${data.id}/pay`);

    } catch (err) {
      alert(err instanceof Error ? err.message : 'Booking failed');
      // Refresh slots on failure
      const dateStr = selectedDate.toISOString().split('T')[0];
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${id}/slots?date=${dateStr}`)
        .then(r => r.json())
        .then(data => setBookedSlots(data));
    } finally {
      setIsBooking(false);
    }
  };

  // --- 4. Handle Review Submission ---
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn || !token) return;
    setIsSubmittingReview(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: newRating, comment: newComment }),
      });

      if (res.ok) {
        // Refresh reviews
        const reviewRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${id}/reviews`);
        setReviews(await reviewRes.json());
        setNewComment('');
        setNewRating(5);
      } else {
        alert("Failed to submit review");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // --- 5. Handle Owner Reply ---
  const handleReplySubmit = async (reviewId: number) => {
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reply: replyText }),
      });

      if (res.ok) {
        // Refresh data to see the new reply
        const reviewRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${id}/reviews`);
        setReviews(await reviewRes.json());
        setReplyingTo(null);
        setReplyText('');
      } else {
        alert("Failed to reply");
      }
    } catch (err) {
      alert("Error posting reply");
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "New";

  return (
    <div className="min-h-screen bg-gray-100 pt-20 relative">
      <div className="max-w-5xl mx-auto p-6">
        {isLoading || !venue ? (
          <p className="text-center text-gray-600">Loading venue...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT COLUMN: Photos, Info & Reviews */}
            <div className="lg:col-span-2 space-y-8">

              {/* Card 1: Visuals & Info */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {photos.length > 0 ? (
                  <div className="w-full h-80 relative">
                    <Swiper modules={[Navigation, Pagination]} navigation pagination={{ clickable: true }} loop={true} className="h-full w-full">
                      {photos.map((photo) => (
                        <SwiperSlide key={photo.id}>
                          <div className="relative w-full h-full">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={photo.image_url} alt={venue.name} className="w-full h-full object-cover" />
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                ) : (
                  <div className="h-64 bg-gray-200 flex items-center justify-center text-gray-500">No Photos</div>
                )}

                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{venue.name}</h1>
                      <p className="text-gray-500 mt-1">{venue.address}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm font-bold">
                        {venue.sport_category}
                      </div>
                      <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">
                        ⭐ {averageRating}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 border-t pt-4">
                    <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                    <p className="text-gray-600 leading-relaxed">{venue.description || "No description available."}</p>
                  </div>
                </div>
              </div>

              {/* Card 2: Reviews Section */}
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-black mb-6">Reviews ({reviews.length})</h2>

                {/* Review Form (Logged in users only) */}
                {isLoggedIn && (
                  <form onSubmit={handleSubmitReview} className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Leave a Review</h3>
                    <div className="flex items-center mb-3">
                      <span className="mr-2 text-gray-600 text-sm">Rating:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button type="button" key={star} onClick={() => setNewRating(star)} className={`text-2xl focus:outline-none ${star <= newRating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
                      ))}
                    </div>
                    <textarea placeholder="Share your experience..." value={newComment} onChange={e => setNewComment(e.target.value)} className="w-full p-3 border rounded-md text-black text-sm mb-3 h-20 focus:ring-2 focus:ring-teal-500 outline-none" required></textarea>
                    <button type="submit" disabled={isSubmittingReview} className="px-4 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-900 disabled:opacity-50 transition-colors">Submit Review</button>
                  </form>
                )}

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviews.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No reviews yet.</p>
                  ) : (
                    reviews.map(review => (
                      <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold mr-3">
                              {review.user_first_name?.[0] || 'U'}
                            </div>
                            <div>
                              <p className="font-semibold text-black text-sm">{review.user_first_name} {review.user_last_name}</p>
                              <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-yellow-400 text-sm">
                            {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm mt-2 ml-13 pl-13">{review.comment}</p>

                        {/* --- OWNER REPLY DISPLAY --- */}
                        {review.reply && (
                          <div className="mt-4 ml-12 bg-gray-50 p-3 rounded-lg border-l-4 border-teal-500">
                            <p className="text-xs font-bold text-teal-700 mb-1">Owner Response</p>
                            <p className="text-sm text-gray-600">{review.reply}</p>
                          </div>
                        )}

                        {/* --- OWNER REPLY FORM --- */}
                        {/* Only show if no reply exists AND user is Owner/Admin */}
                        {!review.reply && isLoggedIn && (role === 'owner' || role === 'admin') && (
                          <div className="mt-2 ml-12">
                            {replyingTo === review.id ? (
                              <div className="mt-3">
                                <textarea
                                  className="w-full p-2 border rounded text-sm text-black focus:ring-1 focus:ring-teal-500"
                                  placeholder="Write your reply..."
                                  value={replyText}
                                  onChange={e => setReplyText(e.target.value)}
                                ></textarea>
                                <div className="flex gap-2 mt-2">
                                  <button onClick={() => handleReplySubmit(review.id)} className="bg-teal-600 text-white text-xs px-3 py-1 rounded hover:bg-teal-700">Post Reply</button>
                                  <button onClick={() => setReplyingTo(null)} className="text-gray-500 text-xs px-3 py-1 hover:text-gray-700">Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <button onClick={() => setReplyingTo(review.id)} className="text-xs text-blue-600 hover:underline mt-2 font-medium">
                                Reply to Review
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Slot Picker (Sticky) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Book Your Slot</h2>

                {/* Date Picker Pills */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
                  {dateOptions.map((date) => {
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayNum = date.getDate();
                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => setSelectedDate(date)}
                        className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-lg border transition-all ${isSelected
                          ? 'bg-teal-600 border-teal-600 text-white shadow-md'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-teal-500'
                          }`}
                      >
                        <span className="text-xs font-medium uppercase">{dayName}</span>
                        <span className="text-lg font-bold">{dayNum}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Time Slots Grid */}
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-3 font-medium">{selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
                  <div className="grid grid-cols-3 gap-3">
                    {timeSlots.map((time) => {
                      const booked = isSlotBooked(time);
                      const past = isPastSlot(time);
                      const disabled = booked || past;
                      const selected = selectedTime === time;


                      return (
                        <button
                          key={time}
                          disabled={disabled}
                          className={`py-2 text-sm font-medium rounded-lg border transition-all
  ${past
                              ? "bg-gray-50 text-gray-400 border-gray-200 opacity-60 cursor-not-allowed"
                              : booked
                                ? "bg-red-50 text-red-400 border-red-200 cursor-not-allowed opacity-70"
                                : selected
                                  ? "bg-teal-600 text-white border-teal-600 shadow"
                                  : "bg-white text-teal-700 border-teal-500 hover:bg-teal-50"
                            }
`}


                        >
                          {formatTime(time)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Footer / Checkbox / Action */}
                <div className="border-t pt-4">

                  {/* Checkbox Section */}
                  <div className="mb-4 flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <div className="text-sm text-gray-600">
                      <label htmlFor="terms" className="cursor-pointer mr-1">
                        I agree to the
                      </label>
                      <Link href="/terms" className="text-teal-600 underline ml-1">
                        Terms & Conditions
                      </Link>
                    </div>
                  </div>

                  {/* Price & Button */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Price</span>
                    <span className="text-xl font-bold text-gray-900">₹{venue.price_per_hour}</span>
                  </div>

                  <button
                    onClick={handleBooking}
                    disabled={!selectedTime || isBooking || !termsAccepted}
                    className={`w-full py-3 rounded-lg font-bold text-lg transition-colors ${!selectedTime || !termsAccepted
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-teal-600 text-white hover:bg-teal-700 shadow-md'
                      }`}
                  >
                    {isBooking ? 'Processing...' : selectedTime ? `Book ${formatTime(selectedTime)}` : 'Select a Time'}
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}