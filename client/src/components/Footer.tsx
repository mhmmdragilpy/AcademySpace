import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center mb-2">
              <span className="text-3xl mr-2">🏛️</span>
              <span className="text-xl font-bold">Academy Spaces</span>
            </div>
            <p className="text-gray-400">Campus Reservation System for Telkom University</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition duration-200">
              About
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition duration-200">
              Contact
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition duration-200">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition duration-200">
              Terms of Service
            </a>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>© 2023 Academy Spaces - Campus Reservation System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
