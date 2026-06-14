'use client'

import { services } from '../constants/services';
import ServicesGrid from "../components/ServicesGrid";

export default function ServicesPage() {
  return (
    <main className="mx-auto md:px-30 px-5 py-12">
      <div className="py-30">
        <h1 className="text-5xl sm:text-6xl font-arts-crafts-regular">Services</h1>
        <p className="mt-4 text-base sm:text-lg opacity-80">
          What can <span className="font-arts-crafts-regular">SOCIETY.</span> do for you?
        </p>
      </div>
      <ServicesGrid items={services} variant='landscape' />
    </main>
  );
}
