// src/app/about/newsroom/page.tsx
export default function NewsroomPage() {
  const news = [
    { date: "Nov 20, 2025", title: "SportGrid Launches Public Beta", snippet: "We are excited to open our platform to venue owners across the city." },
    { date: "Nov 15, 2025", title: "Introducing Team Chat", snippet: "Players can now coordinate matches directly within their team dashboard." },
    { date: "Nov 01, 2025", title: "Venue Analytics for Owners", snippet: "Owners can now track revenue and peak hours in real-time." },
  ];

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-black mb-8">Newsroom</h1>
        <div className="space-y-6">
          {news.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-teal-500">
              <p className="text-sm text-gray-400 mb-1">{item.date}</p>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">{item.title}</h2>
              <p className="text-gray-600">{item.snippet}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}