import HeroCarousel from '@/components/HeroCarousel';
import FullScreenSection from '@/components/FullScreenSection';

export default function HomePage() {
  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory">
      
      <section className="h-screen w-full snap-start flex items-center justify-center pt-14">
        <div className="w-[90%] h-[75vh]">
          <HeroCarousel />
        </div>
      </section>

      <FullScreenSection
        title="CANTONMENT TURF"
        subtitle="The best night games in Belagavi"
        imageUrl="/images/cantonment-turf.jpg"
      />

      <FullScreenSection
        title="CITY TURF"
        subtitle="Perfect grass, perfect game"
        imageUrl="/images/city-turf.jpg"
      />
    </div>
  );
}