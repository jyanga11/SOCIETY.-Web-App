'use client'

import { services } from '../constants/services';
import ServicesGrid from "../components/ServicesGrid";

export default function ServicesPage() {
  return (
    <main className="mx-auto md:px-30 px-5 py-12">
      <div className="m-10">
        {/* Changed to a vertical flex column */}
        <div className="py-10 flex flex-col gap-6">
          {/* Title stays naturally aligned to the left */}
          <h1 className="text-5xl sm:text-7xl font-arts-crafts-regular">
            Services
          </h1>
          
          {/* Paragraph is pushed to the right, text is right-aligned, and width is constrained */}
          <p className="text-base sm:text-3xl opacity-80 max-w-2xl self-end text-left">
            We give independent and under-represented artists access to the 
            services and platform to turn their ideas into fully realized projects. 
          </p>
        </div>
        <ServicesGrid items={services} variant='landscape' />
      </div>
    </main>
  );
}