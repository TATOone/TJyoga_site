import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface PublicPageLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const PublicPageLayout: React.FC<PublicPageLayoutProps> = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-light-text">
      <Header />
      <main className="pt-28 pb-16">
        <section className="container mx-auto px-4 mb-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-dark-brown mb-4">{title}</h1>
            <p className="text-lg text-gray-brown">{subtitle}</p>
          </div>
        </section>
        <section className="container mx-auto px-4">{children}</section>
      </main>
      <Footer />
    </div>
  );
};

export default PublicPageLayout;
