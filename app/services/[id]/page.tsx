import { services } from '../../constants/services';
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
        
        <div className="flex flex-row gap-3 justify-center items-center my-5">

            {/* Left (Previous) Arrow - Only renders if there is a previous service */}
            {hasPrevious && (
                <div className="">
                    <Link 
                        href={`/services/${prevServiceId}`} 
                        className="text-lg sm:text-4xl text-purple-700 hover:text-orange-500 transition-colors duration-200"
                        aria-label="Previous service"
                    >
                        &#5595;
                    </Link>
                </div>
            )}

            <Icon className="sm:w-50 sm:h-50 w-30 h-30 text-purple-700 m-1 sm:m-20" />
            <div className="flex flex-col sm:gap-4 gap-1">
                <h1 className="sm:text-6xl text-2xl font-arts-crafts-regular">{service.title}</h1>
                <p className="sm:mt-4 mt-1 sm:text-3xl text-lg text-orange-500">{service.desc}</p>
            </div>

            {/* Right (Next) Arrow - Only renders if there is a next service */}
            {hasNext && (
                <div className="">
                    <Link 
                        href={`/services/${nextServiceId}`} 
                        className="text-lg sm:text-4xl ml-10 text-purple-700 hover:text-orange-500 transition-colors duration-200"
                        aria-label="Next service"
                    >
                        &#5592;
                    </Link>
                </div>
            )}

        </div>
        
        <div className="w-full flex justify-center mb-5">
            <form action="/submit-endpoint" method="POST" className="w-full max-w-2xl flex flex-col gap-3">
                <div>
                    <label htmlFor="user-email" className="sm:text-2xl text-lg text-orange-500">Email:</label>
                    <input type="email" id="user-email" name="user-email" required  className="rounded-sm border-b-2"/>
                </div>

                <div>
                    <label htmlFor="note" className="sm:text-2xl text-lg text-orange-500 ">Tell us what you&apos;re working on:</label>
                    <textarea id="note" name="note" rows={6} className="w-full h-40 border-2 rounded-sm"/>
                </div>

                <button type="submit" className="text-xl self-end rounded-md px-6 py-2 border-orange-500 border-2 text-orange-500 hover:bg-orange-500 hover:text-purple-700">
                    Send
                </button>
            </form>
        </div>

      </main>
    );
}