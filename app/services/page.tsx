'use client'

import { Atom, Camera, ChartNoAxesCombined, Clapperboard, Film, FingerprintPattern, Goal, Headset, Palette, PanelsTopLeft, ShoppingCart, Turntable } from "lucide-react";
import ServicesGrid from "../components/ServicesGrid";

const services = [
  { 
    id: 1,
    title: 'Photography',
    image: Camera,
    desc: 'take nice photos',
  },
  {
     id: 2,
     title: 'Videography',
     image: Clapperboard,
     desc: 'take nice videos',
  },
  { 
    id: 3,
    title: 'Photo/Video Editing',
    image: Film,
    desc: 'make cool edits',
  },
  {
    id: 4,
    title: 'Graphic Design',
    image: Palette,
    desc: 'sick designs, dope patterns, and wicked fonts',
  },
  { 
    id: 5,
    title: 'Music Production',
    image: Turntable,
    desc: 'for when you need a banger',
  },
  { 
    id: 6,
    title: 'Mixing/Mastering',
    image: Headset,
    desc: 'for all your mixing and mastering needs',
  },
  {
    id: 7,
    title: 'Web Development',
    image: PanelsTopLeft,
    desc: 'let us build your website',
  },
  {
    id: 8,
    title: 'E-Commerce Solutions',
    image: ShoppingCart,
    desc: 'Need an online shop? We can do that too!',
  },
  {
    id: 9,
    title: 'Data Analytics',
    image: ChartNoAxesCombined,
    desc: 'Want to track your metrics?',
  },
  {
    id: 10,
    title: 'Content Strategy',
    image: Goal,
    desc: 'find your vision',
  },
  {
    id: 11,
    title: 'Creative Consulting',
    desc: 'refine your ideas',
    image: Atom,
  },
  {
    id: 12,
    title: 'Brand Identity',
    image: FingerprintPattern,
    desc: 'establish your brand',
  },
];

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
