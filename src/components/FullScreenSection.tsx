// app/components/FullScreenSection.tsx
import Image from 'next/image';

interface Props {
  title: string;
  subtitle: string;
  imageUrl: string;
}

const FullScreenSection = ({ title, subtitle, imageUrl }: Props) => {
  return (
    <section className="h-screen w-full snap-start relative flex items-center justify-center text-center p-4">
      {/* Background Image */}
      <Image src={imageUrl} alt={title} layout="fill" objectFit="cover" className="z-0" />
      {/* Overlay to make text readable */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      {/* Text Content */}
      <div className="z-10 text-white">
        <h2 className="text-5xl md:text-7xl font-bold drop-shadow-lg">{title}</h2>
        <p className="text-xl md:text-2xl mt-4 drop-shadow-lg">{subtitle}</p>
      </div>
    </section>
  );
};

export default FullScreenSection;