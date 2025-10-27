import React from 'react';
import Card from '../../components/Card';

const aboutContentHtml = `
  <h2 class="!mt-0">Our Mission</h2>
  <p>At Flare Auto Earning, our mission is to democratize financial growth by providing a simple, secure, and powerful platform for automated earnings. We believe that everyone deserves the opportunity to build a stable financial future, and we've created a system that combines cutting-edge technology with the proven power of network marketing to make that a reality.</p>
  
  <h2>What is Flare Auto Earning?</h2>
  <p>Flare Auto Earning is a premier online platform designed for individuals seeking to maximize their earning potential. We offer a unique blend of automated daily profits from strategic investments and a multi-level referral program that rewards you for growing your network. Whether you're a seasoned investor or new to the world of online earning, our intuitive system makes it easy to get started and see immediate results.</p>
  
  <h2>How It Works</h2>
  <ol>
    <li><strong>Choose Your Package:</strong> Select an investment package that aligns with your financial goals.</li>
    <li><strong>Earn Daily Profits:</strong> Once you invest, our system automatically generates a steady stream of daily profits for you. No complex trading or analysis required.</li>
    <li><strong>Build Your Team:</strong> Share your unique referral link with friends, family, and colleagues. When they join and invest, you earn a commission.</li>
    <li><strong>Unlock Team Rewards:</strong> As your network grows, you'll unlock commissions from multiple levels of referrals, creating a powerful, long-term passive income stream.</li>
  </ol>
  
  <h2>Why Choose Us?</h2>
  <ul>
    <li><strong>Simplicity:</strong> Our platform is designed to be user-friendly and straightforward. You don't need to be an expert to succeed.</li>
    <li><strong>Transparency:</strong> Track your earnings, team growth, and investment performance in real-time through your personal dashboard.</li>
    <li><strong>Security:</strong> We prioritize the security of your funds and personal information with robust security measures.</li>
    <li><strong>Lucrative Rewards:</strong> Our competitive daily profit rates and multi-level referral structure are designed to maximize your earning potential.</li>
  </ul>
  
  <p>Join Flare Auto Earning today and start your journey towards financial independence. Your future starts now.</p>
`;

const AboutUsPage: React.FC = () => {
  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      <header className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold text-white tracking-tight">
          About <span className="text-brand-orange">Flare Auto Earning</span>
        </h1>
        <p className="text-xl text-brand-gray max-w-3xl mx-auto">
          The simple way to invest, grow your network, and earn rewards.
        </p>
      </header>

      <Card>
        <div 
            className="prose prose-invert prose-p:text-brand-gray prose-h2:text-white prose-h2:text-3xl prose-h2:font-bold prose-a:text-brand-orange hover:prose-a:underline prose-li:text-brand-gray prose-strong:text-white max-w-none"
            dangerouslySetInnerHTML={{ __html: aboutContentHtml }} 
        />
      </Card>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center text-brand-gray">
            <p>
                <strong className="text-white">Website:</strong><br/>
                <a href="http://www.faearing.com" target="_blank" rel="noopener noreferrer" className="text-brand-orange hover:underline">www.faearing.com</a>
            </p>
            <p>
                <strong className="text-white">Support Email:</strong><br/>
                <a href="mailto:support@faearing.com" className="text-brand-orange hover:underline">support@faearing.com</a>
            </p>
        </div>
      </Card>
    </div>
  );
};

export default AboutUsPage;