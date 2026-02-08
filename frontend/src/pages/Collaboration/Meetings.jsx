import { useState } from 'react';
import { FaVideo, FaPlus, FaCalendarAlt, FaClock, FaUsers, FaLink, FaPlay, FaEllipsisV } from 'react-icons/fa';

const Meetings = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showNewMeeting, setShowNewMeeting] = useState(false);

  const meetings = {
    upcoming: [
      { id: 1, title: 'Sprint Planning', date: '2024-02-08', time: '10:00 AM', duration: 60, attendees: 6, type: 'video', status: 'scheduled' },
      { id: 2, title: 'Client Review', date: '2024-02-08', time: '2:00 PM', duration: 45, attendees: 4, type: 'video', status: 'scheduled' },
      { id: 3, title: 'Team Standup', date: '2024-02-09', time: '9:00 AM', duration: 15, attendees: 8, type: 'video', status: 'scheduled' },
    ],
    past: [
      { id: 4, title: 'Design Review', date: '2024-02-05', time: '3:00 PM', duration: 60, attendees: 5, type: 'video', status: 'completed' },
      { id: 5, title: 'Product Demo', date: '2024-02-03', time: '11:00 AM', duration: 30, attendees: 10, type: 'video', status: 'completed' },
    ],
  };

  const isToday = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Meetings</h1>
          <p className="text-gray-500 dark:text-gray-400">Schedule and manage your meetings</p>
        </div>
        <button
          onClick={() => setShowNewMeeting(true)}
          className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
        >
          <FaPlus className="mr-2" /> New Meeting
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <button className="flex items-center justify-center p-4 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors">
          <FaPlay className="mr-2" /> Start Instant Meeting
        </button>
        <button className="flex items-center justify-center p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors">
          <FaCalendarAlt className="mr-2" /> Schedule Meeting
        </button>
        <button className="flex items-center justify-center p-4 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors">
          <FaLink className="mr-2" /> Join with Code
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 font-medium rounded-lg transition-colors ${
            activeTab === 'upcoming'
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Upcoming ({meetings.upcoming.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-2 font-medium rounded-lg transition-colors ${
            activeTab === 'past'
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Past ({meetings.past.length})
        </button>
      </div>

      {/* Meetings List */}
      <div className="space-y-4">
        {meetings[activeTab].map((meeting) => (
          <div key={meeting.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  meeting.status === 'completed' 
                    ? 'bg-gray-100 dark:bg-gray-700' 
                    : 'bg-blue-100 dark:bg-blue-900'
                }`}>
                  <FaVideo className={`text-xl ${
                    meeting.status === 'completed' 
                      ? 'text-gray-500' 
                      : 'text-blue-500'
                  }`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{meeting.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <FaCalendarAlt className="mr-1" />
                      {isToday(meeting.date) ? 'Today' : new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="flex items-center">
                      <FaClock className="mr-1" />
                      {meeting.time} ({meeting.duration} min)
                    </span>
                    <span className="flex items-center">
                      <FaUsers className="mr-1" />
                      {meeting.attendees} attendees
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {meeting.status === 'scheduled' && (
                  <>
                    <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm">
                      Join
                    </button>
                    <button className="px-4 py-2 border dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                      Edit
                    </button>
                  </>
                )}
                {meeting.status === 'completed' && (
                  <button className="px-4 py-2 border dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                    View Recording
                  </button>
                )}
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <FaEllipsisV />
                </button>
              </div>
            </div>
          </div>
        ))}

        {meetings[activeTab].length === 0 && (
          <div className="text-center py-12">
            <FaVideo className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No {activeTab} meetings</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Meetings;

