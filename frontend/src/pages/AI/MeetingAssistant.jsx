import React, { useEffect } from 'react';
import MeetingAssistantComponent from '@components/ai/MeetingAssistant';

const MeetingAssistantPage = () => {
  useEffect(() => {
    document.title = 'Meeting assistant — SchedAI';
  }, []);

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Meeting assistant</h1>
          <p className="page-subtitle">Turn meeting notes into a summary and a list of next steps.</p>
        </div>
      </div>

      <MeetingAssistantComponent />
    </div>
  );
};

export default MeetingAssistantPage;
