'use client'

import { Atom, Camera, ChartNoAxesCombined, Clapperboard, Film, FingerprintPattern, Goal, Headset, Palette, PanelsTopLeft, ShoppingCart, Turntable } from "lucide-react";
import ServicesGrid from "../components/ServicesGrid";

const services = [
  { 
    id: 1,
    title: 'Photography',
    image: Camera,
    desc: 'take nice photos',
    tags: ['visual']
  },
  {
     id: 2,
     title: 'Videography',
     image: Clapperboard,
     desc: 'take nice videos',
     tags: ['visual']
  },
  { 
    id: 3,
    title: 'Photo/Video Editing',
    image: Film,
    desc: 'make cool edits',
    tags: ['visual']
  },
  {
    id: 4,
    title: 'Graphic Design',
    image: Palette,
    desc: 'sick designs, dope patterns, and wicked fonts',
    tags: ['visual']
  },
  { 
    id: 5,
    title: 'Music Production',
    image: Turntable,
    desc: 'for when you need a banger',
    tags: ['audio']
  },
  { 
    id: 6,
    title: 'Mixing/Mastering',
    image: Headset,
    desc: 'for all your mixing and mastering needs',
    tags: ['audio']
  },
  {
    id: 7,
    title: 'Web Development',
    image: PanelsTopLeft,
    desc: 'let us build your website',
    tags: ['tech']
  },
  {
    id: 8,
    title: 'E-Commerce Solutions',
    image: ShoppingCart,
    desc: 'Need an online shop? We can do that too!',
    tags: ['tech']
  },
  {
    id: 9,
    title: 'Data Analytics',
    image: ChartNoAxesCombined,
    desc: 'Want to track your metrics?',
    tags: ['tech']
  },
  {
    id: 10,
    title: 'Content Strategy',
    image: Goal,
    desc: 'find your vision',
    tags: ['marketing']
  },
  {
    id: 11,
    title: 'Creative Consulting',
    desc: 'refine your ideas',
    image: Atom,
    tags: ['marketing']
  },
  {
    id: 12,
    title: 'Brand Identity',
    image: FingerprintPattern,
    desc: 'establish your brand',
    tags: ['marketing']
  },
];

export default function ServicesPage() {
  return (
    <main className="mx-auto px-30 py-12">
      <h1 className="text-5xl sm:text-6xl font-arts-crafts-regular">Our Services</h1>
      <p className="mt-4 text-base sm:text-lg opacity-80">
        What can <span className="font-arts-crafts-regular">SOCIETY.</span> do for you?
      </p>
      <ServicesGrid items={services} variant='landscape' />
    </main>
  );
}
