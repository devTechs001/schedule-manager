import React, { useState, useRef, useEffect } from 'react';
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaDesktop, FaPhone, FaUsers, FaComments, FaExpand } from 'react-icons/fa';

const VideoConference = ({ roomId, participants = [], onLeave }) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const localVideoRef = useRef(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    startLocalVideo();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const startLocalVideo = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioOn(!isAudioOn);
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setIsScreenSharing(true);
        screenStream.getVideoTracks()[0].onended = () => setIsScreenSharing(false);
      } catch (error) {
        console.error('Screen share error:', error);
      }
    } else {
      setIsScreenSharing(false);
    }
  };

  const handleLeave = () => {
    stream?.getTracks().forEach(track => track.stop());
    onLeave?.();
  };

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {/* Main Video Area */}
      <div className="relative aspect-video bg-black">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {!isVideoOn && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="w-24 h-24 rounded-full bg-primary-600 flex items-center justify-center text-white text-3xl">
              You
            </div>
          </div>
        )}

        {/* Participants Thumbnails */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {participants.slice(0, 4).map((p, i) => (
            <div key={i} className="w-32 h-24 rounded-lg bg-gray-700 flex items-center justify-center text-white overflow-hidden">
              <span>{p.name?.[0] || 'P'}</span>
            </div>
          ))}
        </div>

        {/* Room Info */}
        <div className="absolute top-4 left-4 flex items-center gap-2 text-white bg-black/50 px-3 py-1 rounded-full">
          <FaUsers />
          <span>{participants.length + 1} in call</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 p-4 bg-gray-800">
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-full ${isAudioOn ? 'bg-gray-700 text-white' : 'bg-red-600 text-white'}`}
        >
          {isAudioOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
        </button>
        
        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full ${isVideoOn ? 'bg-gray-700 text-white' : 'bg-red-600 text-white'}`}
        >
          {isVideoOn ? <FaVideo size={20} /> : <FaVideoSlash size={20} />}
        </button>

        <button
          onClick={toggleScreenShare}
          className={`p-4 rounded-full ${isScreenSharing ? 'bg-green-600' : 'bg-gray-700'} text-white`}
        >
          <FaDesktop size={20} />
        </button>

        <button
          onClick={() => setShowChat(!showChat)}
          className="p-4 rounded-full bg-gray-700 text-white"
        >
          <FaComments size={20} />
        </button>

        <button className="p-4 rounded-full bg-gray-700 text-white">
          <FaExpand size={20} />
        </button>

        <button
          onClick={handleLeave}
          className="p-4 rounded-full bg-red-600 text-white ml-4"
        >
          <FaPhone size={20} className="rotate-[135deg]" />
        </button>
      </div>

      {/* Chat Panel */}
      {showChat && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gray-800 border-l border-gray-700 p-4">
          <h4 className="text-white font-medium mb-4">Chat</h4>
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-2">
              <p className="text-gray-400 text-sm text-center">No messages yet</p>
            </div>
            <input
              type="text"
              placeholder="Send a message..."
              className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoConference;

