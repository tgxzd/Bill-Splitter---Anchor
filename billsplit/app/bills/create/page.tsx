'use client';

import BillForm from '../../../components/BillForm';

export default function CreateBill() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Bill</h1>
      <BillForm />
    </div>
  );
} 