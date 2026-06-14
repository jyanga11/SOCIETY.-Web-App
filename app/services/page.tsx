'use client'

import { services } from '../constants/services';
import ServicesGrid from "../components/ServicesGrid";

export default function ServicesPage() {
  return (
    <main className="mx-auto md:px-30 px-5 py-12">
      <div className="m-2 sm:m-10">
        <div className="py-10 flex flex-col gap-6">
          <h1 className="text-3xl sm:text-7xl font-arts-crafts-regular">
            Services
          </h1>
          
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