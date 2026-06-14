import { services } from '../../constants/services';

export default async function ServicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const service = services.find(s => String(s.id) === id);
  
    if (!service) return <p>Service not found.</p>;
  
    const Icon = service.image;
  
    return (
      <main className="min-h-screen min-w-screen items-center justify-center">
        <div className="flex flex-row gap-3 justify-center items-center">
            <Icon size={256} className="text-purple-700 m-20" />
            <div className="flex flex-col gap-4">
                <h1 className="text-5xl font-arts-crafts-regular text-purple-700">{service.title}</h1>
                <p className="mt-4 text-2xl text-orange-500">{service.desc}</p>
            </div>
        </div>
        <div className="w-full flex justify-center">
            <form action="/submit-endpoint" method="POST" className="w-full max-w-2xl flex flex-col gap-3">

                <div>
                    <label htmlFor="user-email" className="text-2xl text-orange-500">Email:</label>
                    <input type="email" id="user-email" name="user-email" required  className="rounded-sm border-purple-700 border-b-2"/>
                </div>

                <div>
                    <label htmlFor="note" className="text-2xl text-orange-500">Note:</label>
                    <textarea id="note" name="note" rows={6} className="w-full border-2 border-purple-700 rounded-sm"/>
                </div>

                <button type="submit" className="text-xl self-end rounded-md px-6 py-2 border-orange-500 border-2 text-orange-500 hover:bg-orange-500 hover:text-white">
                    Send
                </button>
            </form>
        </div>
      </main>
    );
  }