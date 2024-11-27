import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedin, faXTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';

interface LeftSectionProps {
  backgroundChoice: string;
}

const LeftSection: React.FC<LeftSectionProps> = ({ backgroundChoice }) => {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Trigger fade-in when component is mounted
    const timeout = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  // calcola l'opacità in base alla scelta del background
  const opacity = backgroundChoice === "Neurons" ? 0.4 : backgroundChoice === "Blizzard" ? 0.3 : 0.2;

  return (
    <div
      className={`left-section transition-opacity duration-500 ${
        fadeIn ? 'opacity-100' : 'opacity-0'
      } flex flex-col text-center text-white items-center justify-center p-8 rounded-lg shadow-lg max-w-4xl mx-auto h-full`}
      style={{
        backgroundColor: `rgba(31, 41, 55, ${opacity})`, // Imposta bg-opacity dinamicamente
      }}
    >
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
        <h2 className="text-2xl mb-2">Giulio Capecchi</h2>
        <p className="text-lg mb-5">
          Graduate in Computer Engineering, student of AI & Data Engineering @unipisa.
        </p>
        <ul className="list-none p-0 flex gap-4 justify-center">
          <li className="mb-2 inline-block">
            <a
              href="https://github.com/giuliocapecchi"
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline text-lg transition-colors duration-300 hover:text-blue-400"
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
              href="https://x.com/giuliocapecchi_"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white no-underline text-lg transition-colors duration-300 hover:text-blue-400"
            >
              <FontAwesomeIcon icon={faXTwitter} size="2x" />
            </a>
          </li>
          <li className="mb-2 inline-block">
            <a
              href="https://www.instagram.com/giulio_capecchi/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white no-underline text-lg transition-colors duration-300 hover:text-blue-400"
            >
              <FontAwesomeIcon icon={faInstagram} size="2x" />
            </a>
          </li>
          <li className="mb-2 inline-block">
            <a
              href="mailto:giuliocapecchi2000@gmail.com"
              className="text-white no-underline text-lg transition-colors duration-300 hover:text-blue-400"
            >
              <FontAwesomeIcon icon={faEnvelope} size="2x" />
            </a>
          </li>
        </ul>
      </div>
      <div className="mt-5 flex justify-center items-center">
        <FontAwesomeIcon icon={faMapMarkerAlt} size="lg" className="text-white mr-2" />
        <span className="text-lg text-white">Currently in: Pisa</span>
      </div>
    </div>
  );
};

export default LeftSection;
