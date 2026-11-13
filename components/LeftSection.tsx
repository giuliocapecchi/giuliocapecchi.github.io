import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedin, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faFileLines, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';

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
                <FontAwesomeIcon icon={faFileLines} size="2x" />
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
