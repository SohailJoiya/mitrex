import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import api from '../../services/api';

const AboutUsPage: React.FC = () => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await api.get<{ aboutHtml: string }>('/api/system/public/about', true);
        setContent(data.aboutHtml);
      } catch (error) {
        console.error("Failed to fetch about us content:", error);
        setContent("<p class='text-red-400'>Could not load content at this time. Please try again later.</p>");
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, []);

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      <header className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold text-white tracking-tight">
          About <span className="text-brand-orange">FIN2X</span>
        </h1>
        <p className="text-xl text-brand-gray max-w-3xl mx-auto">
          The simple way to invest, grow your network, and earn rewards.
        </p>
      </header>

      <Card>
        {isLoading ? (
            <p className="text-brand-gray">Loading content...</p>
        ) : (
            <div 
                className="prose prose-invert prose-p:text-brand-gray prose-h2:text-white prose-h2:text-3xl prose-h2:font-bold prose-a:text-brand-orange hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: content }} 
            />
        )}
      </Card>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center text-brand-gray">
            <p>
                <strong className="text-white">Website:</strong><br/>
                <a href="http://www.fin2x.uk" target="_blank" rel="noopener noreferrer" className="text-brand-orange hover:underline">www.fin2x.uk</a>
            </p>
            <p>
                <strong className="text-white">Support Email:</strong><br/>
                <a href="mailto:support@fin2x.uk" className="text-brand-orange hover:underline">support@fin2x.uk</a>
            </p>
        </div>
      </Card>
    </div>
  );
};

export default AboutUsPage;