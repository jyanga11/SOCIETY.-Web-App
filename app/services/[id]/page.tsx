import { ChevronLeft, ChevronRight } from 'lucide-react';
import { services } from '../../constants/services';
import InquiryForm from "@/app/components/InquiryForm";
import Link from 'next/link';

export default async function ServicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    // Find the current service index
    const currentIdx = services.findIndex(s => String(s.id) === id);
    const service = services[currentIdx];
  
    if (!service) return <p>Service not found.</p>;
  
    // Determine previous and next items without looping
    const hasPrevious = currentIdx > 0;
    const hasNext = currentIdx < services.length - 1;

    const prevServiceId = hasPrevious ? services[currentIdx - 1].id : null;
    const nextServiceId = hasNext ? services[currentIdx + 1].id : null;

    const Icon = service.image;
  
    return (
      <main className="min-w-screen px-5 items-center justify-center relative">
        
        <div className="flex flex-row gap-2 justify-center items-center">

            {hasPrevious && (
                <div className="m-2">
                    <Link 
                        href={`/services/${prevServiceId}`} 
                        className="absolute sm:left-50 left-1 text-purple-700 hover:text-orange-500 transition-colors duration-200"
                        aria-label="Previous service"
                    >
                        <ChevronLeft className="h-12 w-12 sm:h-20 sm:w-20" />
                    </Link>
                </div>
            )}

            <Icon className="w-50 h-50 text-purple-700 m-1 sm:m-20" />
            <div className="flex flex-col sm:gap-4 gap-1 sm:max-w-100">
                <h1 className="sm:text-6xl text-2xl font-arts-crafts-regular">{service.title}</h1>
                <p className="sm:mt-4 mt-1 sm:text-3xl text-lg text-orange-500">{service.desc}</p>
            </div>

            {hasNext && (
                <div className="m-2">
                    <Link 
                        href={`/services/${nextServiceId}`} 
                        className="absolute sm:right-50 right-1 text-purple-700 hover:text-orange-500 transition-colors duration-200"
                        aria-label="Next service"
                    >
                        <ChevronRight className="h-12 w-12 sm:h-20 sm:w-20" />
                    </Link>
                </div>
            )}

        </div>
        
        <div className="w-full flex justify-center mb-5">
            <div className="mb-5 flex w-full justify-center">
                <InquiryForm serviceType={service.title} />
            </div>
        </div>

      </main>
    );
}