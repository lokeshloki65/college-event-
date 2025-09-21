import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin,
  ExternalLink
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* College Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 kongu-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">Kongu Events</h3>
                <p className="text-sm text-gray-400">Engineering College</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Kongu Engineering College's official event management system. 
              Stay updated with all technical and cultural events happening on campus.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com/konguengineering" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-500 transition-colors duration-200"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com/konguengineering" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com/konguengineering" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-500 transition-colors duration-200"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com/school/kongu-engineering-college" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/events" 
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  All Events
                </Link>
              </li>
              <li>
                <Link 
                  to="/events?status=upcoming" 
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link 
                  to="/events?status=ongoing" 
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Ongoing Events
                </Link>
              </li>
              <li>
                <a 
                  href="https://kongu.edu" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center"
                >
                  College Website
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
            </ul>
          </div>

          {/* Departments */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Departments</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/events?department=Computer Science and Engineering" 
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Computer Science
                </Link>
              </li>
              <li>
                <Link 
                  to="/events?department=Electronics and Communication Engineering" 
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  ECE
                </Link>
              </li>
              <li>
                <Link 
                  to="/events?department=Mechanical Engineering" 
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Mechanical
                </Link>
              </li>
              <li>
                <Link 
                  to="/events?department=Electrical and Electronics Engineering" 
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  EEE
                </Link>
              </li>
              <li>
                <Link 
                  to="/events?department=Civil Engineering" 
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Civil
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-gray-400 text-sm">
                  Kongu Engineering College<br />
                  Perundurai, Erode - 638060<br />
                  Tamil Nadu, India
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <a 
                  href="tel:+914294226000" 
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  +91 4294 226000
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <a 
                  href="mailto:events@kongu.edu" 
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  events@kongu.edu
                </a>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Event Support</h4>
              <p className="text-xs text-gray-400">
                For event-related queries and support, contact our student affairs office.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                © {currentYear} Kongu Engineering College. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Event Management System v1.0
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link 
                to="/privacy" 
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms" 
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
              >
                Terms of Service
              </Link>
              <Link 
                to="/help" 
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
              >
                Help
              </Link>
            </div>
          </div>

          {/* College Accreditation */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              AICTE Approved | NAAC Accredited | Anna University Affiliated
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
