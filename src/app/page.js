'use client';

import { useRouter } from 'next/navigation';

function generateSupportRoomName() {
  const number = Math.floor(1000000000 + Math.random() * 9000000000);
  return `support-${number}`;
}

export default function Home() {
  const router = useRouter();

  const createChat = () => {
    const id = generateSupportRoomName();
    router.push(`/chat/${id}`);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Hero / Banner Section */}
      <section className="flex flex-col justify-center items-center text-center px-6 py-24 bg-gradient-to-br from-gray-100 to-white">
        <h1 className="text-5xl font-bold mb-4">
          Welcome to <span className="text-black">SupportChat</span>
        </h1>
        <p className="text-lg max-w-2xl mb-8 text-gray-600">
          Create instant, secure, anonymous chat rooms for customer support. No login required — just click and share the chat link.
        </p>
        <button
          onClick={createChat}
          className="bg-black text-white hover:bg-white hover:text-black border border-black px-6 py-3 rounded-xl transition"
        >
          Start New Support Chat
        </button>
      </section>

      {/* Why SupportChat Section */}
      <section className="py-20 bg-white px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-12">Why SupportChat?</h2>
          <div className="grid md:grid-cols-3 gap-12 text-left">
            <div>
              <h3 className="text-xl font-bold mb-2">⚡ Instant Setup</h3>
              <p>No login. No dashboard. Just click and start chatting with a unique link.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">🔒 Private by Design</h3>
              <p>Each chat is anonymous and temporary. No tracking, no saving, no worries.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">📱 Mobile-First</h3>
              <p>Built for speed and simplicity. Seamless experience on all devices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call-To-Action Section */}
      <section className="py-20 px-6 bg-gray-50 text-center">
        <h2 className="text-3xl font-semibold mb-6">Support made simple.</h2>
        <p className="text-lg text-gray-600 mb-8">
          Give your customers what they need — a quick and easy way to reach you.
        </p>
        <button
          onClick={createChat}
          className="bg-black text-white hover:bg-white hover:text-black border border-black px-6 py-3 rounded-xl transition"
        >
          Start New Support Chat
        </button>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-400 border-t">
        © {new Date().getFullYear()} SupportChat · Built for modern customer support
      </footer>
    </div>
  );
}
