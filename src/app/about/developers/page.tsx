// src/app/about/developers/page.tsx
import { User } from 'lucide-react';

export default function DevelopersPage() {
  const team = [
    { name: "Team Member 1", role: "Full Stack Developer", bio: "Architected the Go backend and database schema." },
    { name: "Team Member 2", role: "Frontend Engineer", bio: "Designed the Next.js UI and user experience." },
    { name: "Team Member 3", role: "DevOps Engineer", bio: "Managed deployment pipelines on Render and Vercel." },
    { name: "Team Member 4", role: "QA & Product", bio: "Ensured quality and defined product requirements." },
  ];

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">Meet the Builders</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            SportGrid was built as a Senior Design Project to solve the complexity of sports venue management through modern engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="w-24 h-24 mx-auto bg-teal-100 rounded-full flex items-center justify-center mb-4 text-teal-600">
                <User size={48} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
              <p className="text-teal-600 font-medium text-sm mb-3">{member.role}</p>
              <p className="text-gray-500 text-sm">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}