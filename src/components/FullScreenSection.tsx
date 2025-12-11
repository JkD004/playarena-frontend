// src/components/FullScreenSection.tsx
import Image from 'next/image';
import Link from 'next/link';

interface Props {
  title: string;
  subtitle: string;
  imageUrl: string;
  href: string;
}

const FullScreenSection = ({ title, subtitle, imageUrl, href }: Props) => {
  return (
    <Link
      href={href}
      className="h-screen w-full snap-start relative flex items-center justify-center text-center p-4 group bg-black"
    >
      {/* Render image ONLY if it's a valid URL */}
      {imageUrl && imageUrl.startsWith('/') && (
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover z-0 transition-transform duration-500 group-hover:scale-105"
        />
      )}

      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      <div className="z-10 text-white">
        <h2 className="text-5xl md:text-7xl font-bold drop-shadow-lg">{title}</h2>
        <p className="text-xl md:text-2xl mt-4 drop-shadow-lg">{subtitle}</p>
      </div>
    </Link>
  );
};

export default FullScreenSection;
