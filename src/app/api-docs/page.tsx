import { getApiDocs } from '@/lib/swagger';
import ReactSwagger from '@/components/ReactSwagger';

export default async function IndexPage() {
    const spec = await getApiDocs();
    return (
        <section className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-4">FairBid Developer API</h1>
            <ReactSwagger spec={spec} />
        </section>
    );
}
