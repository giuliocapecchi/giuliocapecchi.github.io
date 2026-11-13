import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedin, faXTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';

// Business card with "CV" cut out, drawn to match the Font Awesome icons next to it.
const CvCardIcon: React.FC = () => (
  <svg className="svg-inline--fa fa-2x" viewBox="0 0 576 512" aria-hidden="true">
    <defs>
      <mask id="cv-card-cutout">
        <rect width="576" height="512" fill="#fff" />
        <g fill="none" stroke="#000" strokeWidth="34" strokeLinecap="round" strokeLinejoin="round">
          <path d="M150 204 A68 68 0 1 0 150 308" />
          <path d="M184 190 L224 322 L264 190" />
        </g>
        <rect x="300" y="190" width="210" height="34" rx="17" fill="#000" />
        <rect x="300" y="250" width="210" height="34" rx="17" fill="#000" />
        <rect x="300" y="310" width="140" height="34" rx="17" fill="#000" />
      </mask>
    </defs>
    <rect x="0" y="32" width="576" height="448" rx="64" fill="currentColor" mask="url(#cv-card-cutout)" />
  </svg>
);

const LeftSection: React.FC = () => {
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    setFadeIn(false);
    const timeout = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timeout);
  }, []);

    return (
    <div
      className={`left-section transition-opacity duration-500 ${
        fadeIn ? 'opacity-100' : 'opacity-0'
      } flex flex-col text-center text-white items-center justify-center pt-16 pb-8 px-8 rounded-lg max-w-4xl mx-auto h-full`}
    >
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="profile-photo-container w-36 h-36 mb-5 overflow-hidden flex justify-center items-center">
          <Image
            src="/pf_pic.jpg"
            alt="Profile picture"
            className="profile-photo object-cover rounded-lg"
            width={150}
            height={150}
            priority
          />
        </div>
        <div className="links">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Giulio Capecchi</h2>
          <div className="text-lg mb-5 space-y-2">
            <div className="flex flex-col text-blue-300">
              <div className="flex items-center justify-center gap-2">
                <Image src="/gpu.svg" alt="GPU icon" width={16} height={16} className="w-5 h-5" />
                <span className="font-semibold">Computer Eng. • AIDE @unipi</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-purple-300">
              <Image src="/mlp.svg" alt="MLP icon" width={16} height={16} className="w-6 h-6" />
              <span className="font-semibold">ML Engineer @Tuboolar</span>
            </div>
          </div>
          <ul className="list-none p-0 flex gap-4 justify-center">
            <li className="mb-2 inline-block">
              <a
                href="https://github.com/giuliocapecchi"
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline text-lg transition-colors duration-300 hover:text-white"
              >
                <FontAwesomeIcon icon={faGithub} size="2x" />
              </a>
            </li>
            <li className="mb-2 inline-block">
              <a
                href="https://www.linkedin.com/in/giulio-capecchi/"
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline text-lg transition-colors duration-300 hover:text-blue-400"
              >
                <FontAwesomeIcon icon={faLinkedin} size="2x" />
              </a>
            </li>
            <li className="mb-2 inline-block">
              <a
                href="https://x.com/giulio_capecchi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white no-underline text-lg transition-colors duration-300 hover:text-white"
              >
                <FontAwesomeIcon icon={faXTwitter} size="2x" />
              </a>
            </li>
            <li className="mb-2 inline-block">
              <a
                href="https://www.instagram.com/giulio_capecchi/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white no-underline text-lg transition-colors duration-300 hover:text-pink-400"
              >
                <FontAwesomeIcon icon={faInstagram} size="2x" />
              </a>
            </li>
            <li className="mb-2 inline-block">
              <a
                href="mailto:giuliocapecchi2000@gmail.com"
                className="text-white no-underline text-lg transition-colors duration-300 hover:text-green-400"
              >
                <FontAwesomeIcon icon={faEnvelope} size="2x" />
              </a>
            </li>
            <li className="mb-2 inline-block">
              <a
                href="/cv/"
                title="CV"
                aria-label="CV"
                className="text-white no-underline text-lg transition-colors duration-300 hover:text-purple-300"
              >
                <CvCardIcon />
              </a>
            </li>
          </ul>
        </div>
        <div className="mt-5 flex justify-center items-center">
          <FontAwesomeIcon icon={faMapMarkerAlt} size="lg" className="text-white/60 mr-2" />
          <span className="text-sm text-white/60">Currently in: <a href="https://www.google.com/maps/place/Lucca" className="hover:text-blue-400 underline underline-offset-2 transition-colors duration-300">Lucca</a></span>
        </div>
      </div>
    </div>
  );
};

export default LeftSection;
