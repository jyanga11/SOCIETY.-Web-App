'use client'

import { services } from '../constants/services';
import ServicesGrid from "../components/ServicesGrid";

export default function ServicesPage() {
  return (
    <main className="relative z-20 mx-auto md:px-30 px-5 py-12">
      <div className="m-2 sm:m-10">
        <div className="py-10 flex flex-col gap-6">
          <h1 className="text-3xl sm:text-8xl font-arts-crafts-regular">
            Services
          </h1>
        </div>
        <ServicesGrid items={services} variant='landscape' />
      </div>
    </main>
  );
}