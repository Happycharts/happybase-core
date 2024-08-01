import React from 'react';
import Logo from '@/public/happybase.svg'

const ExpiredPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-black mb-4">Link Expired</h1>
        <p className="text-xl text-gray-700 mb-8">
          Sorry, the link you are trying to access has expired.
        </p>
        <a
          href="https://www.happybase.co"
          className="px-6 py-3 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-[#fc4c69] hover:text-black transition duration-300"
        >
          Visit Happybase
        </a>
      </div>
      <div className="mt-12">
        <img
          src="https://media.giphy.com/media/l2SqdO8s85fsCUhGM/giphy.gif?cid=790b7611amnz9a0tw1uxj3nbidt4j18v2bk6qlw1e7ge4580&ep=v1_gifs_search&rid=giphy.gif&ct=g"
          alt="Expired Link"
          className="rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
};

export default ExpiredPage;
