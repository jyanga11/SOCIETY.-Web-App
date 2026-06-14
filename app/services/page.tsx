'use client'

import { services } from '../constants/services';
import ServicesGrid from "../components/ServicesGrid";

export default function ServicesPage() {
  return (
    <main className="mx-auto md:px-30 px-5 py-12">
      <div className="py-10 flex justify-between">
        <h1 className="text-5xl sm:text-8xl font-arts-crafts-regular pt-20">Services</h1>
        <p className="mt-4 text-base sm:text-3xl opacity-80 max-w-[60vw] min-w-[50vw] pt-50">
          We give independent and under-represented artists access to the 
          services and platform to turn their ideas into fully realized projects. 
        </p>
      </div>
      <ServicesGrid items={services} variant='landscape' />
    </main>
  );
}
