//src\app\owner\venues\[id]\page.tsx

"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import toast from 'react-hot-toast';

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
  start_time: string; // in UTC from API
  end_time: string;   // in UTC from API
}

export default function VenueDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { isLoggedIn, token } = useAuth();

  const [venue, setVenue] = useState<Venue | null>(null);
  const [photos, setPhotos] = useState<VenuePhoto[]>([]);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Convert 24h → 12h format
  const formatTime = (t: string) => {
    const [hStr, m] = t.split(":");
    let h = parseInt(hStr);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  };

  // Generate Next 7 days
  const dateOptions = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  // Generate times based on venue hours
  const generateTimeSlots = () => {
    if (!venue) return [];
    const slots = [];
    const startHour = parseInt(venue.opening_time.split(":")[0]);
    const endHour = parseInt(venue.closing_time.split(":")[0]);

    const lunchStart = venue.lunch_start_time ? parseInt(venue.lunch_start_time.split(":")[0]) : -1;
    const lunchEnd = venue.lunch_end_time ? parseInt(venue.lunch_end_time.split(":")[0]) : -1;

    for (let i = startHour; i < endHour; i++) {
      if (i >= lunchStart && i < lunchEnd) continue;
      slots.push(`${i.toString().padStart(2, "0")}:00`);
    }
    return slots;
  };
  const timeSlots = generateTimeSlots();

  // Fetch Venue & Photos
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const [v, p] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${id}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${id}/photos`)
        ]);

        if (v.ok) setVenue(await v.json());
        if (p.ok) setPhotos(await p.json());
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  // ⭐ Correct UTC-safe slot checker
  const isSlotBooked = (timeStr: string) => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");

    const localSlot = new Date(`${year}-${month}-${day}T${timeStr}:00`);
    const slotStartUTC = localSlot.getTime();
    const slotEndUTC = slotStartUTC + 60 * 60 * 1000;

    return bookedSlots.some((b) => {
      const bookingStartUTC = new Date(b.start_time).getTime();
      const bookingEndUTC = new Date(b.end_time).getTime();
      return slotStartUTC < bookingEndUTC && slotEndUTC > bookingStartUTC;
    });
  };

  // ⭐ Fetch booked slots with correct date handling
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const d = String(selectedDate.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/venues/${id}/slots?date=${dateStr}`
        );
        if (res.ok) {
          const data = await res.json();
          setBookedSlots(data);

          // If user selected a time that is actually booked → unselect
          if (selectedTime && isSlotBooked(selectedTime)) {
            setSelectedTime(null);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    load();
  }, [id, selectedDate]);

  // ⭐ Optimistic booking
  const handleBooking = async () => {
    if (!isLoggedIn || !token) {
      router.push(`/login?redirect=/venues/${id}`);
      return;
    }
    if (!selectedTime) return;

    setIsBooking(true);

    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");

    const start = new Date(`${y}-${m}-${d}T${selectedTime}:00`);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          venue_id: parseInt(id),
          start_time: start.toISOString(),
          end_time: end.toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");

      // Optimistic block
      setBookedSlots((p) => [...p, {
        start_time: start.toISOString(),
        end_time: end.toISOString()
      }]);

      setSelectedTime(null);
      router.push(`/bookings/${data.id}/pay`);

    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20 relative">
      <div className="max-w-5xl mx-auto p-6">
        {isLoading || !venue ? (
          <p className="text-center text-gray-600">Loading venue...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT SIDE */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                
                {photos.length > 0 ? (
                  <div className="w-full h-80">
                    <Swiper modules={[Navigation, Pagination]} navigation pagination={{ clickable: true }} loop>
                      {photos.map((p) => (
                        <SwiperSlide key={p.id}>
                          <img src={p.image_url} alt={venue.name}
                               className="w-full h-full object-cover" />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                ) : (
                  <div className="h-64 bg-gray-200 flex justify-center items-center text-gray-600">No Photos</div>
                )}

                <div className="p-6">
                  <div className="flex justify-between">
                    <div>
                      <h1 className="text-3xl font-bold">{venue.name}</h1>
                      <p className="text-gray-500">{venue.address}</p>
                    </div>
                    <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm font-semibold">
                      {venue.sport_category}
                    </span>
                  </div>

                  <hr className="my-4" />

                  <h3 className="font-semibold mb-1">About</h3>
                  <p className="text-gray-600">{venue.description || "No description available."}</p>
                </div>

              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-sm sticky top-24">

                <h2 className="text-xl font-bold mb-4">Book Your Slot</h2>

                {/* DATE SELECTOR */}
                <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                  {dateOptions.map((d) => {
                    const sel = d.toDateString() === selectedDate.toDateString();
                    return (
                      <button
                        key={d.toISOString()}
                        onClick={() => setSelectedDate(d)}
                        className={`w-14 h-16 rounded-lg flex flex-col justify-center items-center border
                          ${sel ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-600"}`}
                      >
                        <span className="text-xs uppercase">
                          {d.toLocaleDateString("en-US", { weekday: "short" })}
                        </span>
                        <span className="text-lg font-bold">{d.getDate()}</span>
                      </button>
                    );
                  })}
                </div>

                {/* TIME SLOTS */}
                <p className="text-sm text-gray-500 mb-2">
                  {selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                </p>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {timeSlots.map((t) => {
                    const disabled = isSlotBooked(t);
                    const selected = t === selectedTime;

                    return (
                      <button
                        key={t}
                        disabled={disabled}
                        onClick={() => setSelectedTime(t)}
                        className={`py-2 rounded text-sm border 
                          ${disabled
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                            : selected
                            ? "bg-teal-600 text-white border-teal-600"
                            : "bg-white text-teal-700 border-teal-500 hover:bg-teal-50"
                          }`}
                      >
                        {formatTime(t)}
                      </button>
                    );
                  })}
                </div>

                {/* TERMS */}
                <label className="flex gap-2 text-sm text-gray-600 mb-4">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={e => setTermsAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4"
                  />
                  I agree to the{" "}
                  <Link href="/terms" className="text-teal-600 underline">
                    Terms & Conditions
                  </Link>
                </label>

                {/* PRICE */}
                <div className="flex justify-between text-gray-700 mb-4">
                  <span>Price</span>
                  <span className="text-xl font-bold">₹{venue.price_per_hour}</span>
                </div>

                {/* BOOK BUTTON */}
                <button
                  onClick={handleBooking}
                  disabled={!selectedTime || !termsAccepted || isBooking}
                  className={`w-full py-3 rounded-lg font-bold text-lg
                    ${(!selectedTime || !termsAccepted)
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-teal-600 text-white hover:bg-teal-700"}`}
                >
                  {isBooking ? "Processing..." : selectedTime ? `Book ${formatTime(selectedTime)}` : "Select a Time"}
                </button>

              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
