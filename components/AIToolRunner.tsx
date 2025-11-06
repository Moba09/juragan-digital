
import React from 'react';
import { Tool } from '../types';
import AIWriterPro from './tools/AIWriterPro';
import TrendPredictor from './tools/TrendPredictor';
import AIImageCreator from './tools/AIImageCreator';
import ImageEditor from './tools/ImageEditor';
import ImageAnalyzer from './tools/ImageAnalyzer';
import ResearchAssistant from './tools/ResearchAssistant';
import VideoGenerator from './tools/VideoGenerator';
import NicheAnalyzer from './tools/NicheAnalyzer';
import LiveConversation from './tools/LiveConversation';
import AudioTranscriber from './tools/AudioTranscriber';
import TextToSpeech from './tools/TextToSpeech';
import ContentCalendarCreator from './tools/ContentCalendarCreator';
import ComingSoon from './ComingSoon';

interface AIToolRunnerProps {
  tool: Tool;
}

const AIToolRunner: React.FC<AIToolRunnerProps> = ({ tool }) => {
  switch (tool.id) {
    case 1:
      return <AIWriterPro />;
    case 2:
      return <TrendPredictor />;
    case 3:
      return <AIImageCreator />;
    case 4:
      return <ImageEditor />;
    case 5:
      return <ImageAnalyzer />;
    case 6:
      return <ResearchAssistant />;
    case 7:
      return <VideoGenerator />;
    case 8:
      return <NicheAnalyzer />;
    case 9:
      return <LiveConversation />;
    case 10:
      return <AudioTranscriber />;
    case 11:
      return <TextToSpeech />;
    case 13:
      return <ContentCalendarCreator />;
    default:
      return <ComingSoon message={`Tool "${tool.title}" is not implemented yet.`} />;
  }
};

export default AIToolRunner;