import { getProduct } from "@/lib/actions";
import { notFound } from "next/navigation";
import OrderForm from "./OrderForm";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto">
      <OrderForm product={product} />
    </div>
  );
}
