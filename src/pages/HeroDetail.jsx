import { useParams } from "react-router-dom";

function HeroDetail() {
  const { heroId } = useParams();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Hero Detail</h1>

        <p className="mt-1 text-sm text-black/50 dark:text-white/50">
          Hero ID: {heroId}
        </p>
      </div>
    </div>
  );
}

export default HeroDetail;
