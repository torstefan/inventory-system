import InventorySystem from '@/components/inventory/InventorySystem';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Inventory Management System
        </h1>
        <InventorySystem />
      </div>
    </main>
  );
}
