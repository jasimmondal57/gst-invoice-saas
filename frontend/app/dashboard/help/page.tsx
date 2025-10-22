'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VyapaarPage } from '@/components/VyapaarPageTemplate';
import { PrimaryButton, Card, CardHeader } from '@/components/VyapaarComponents';

export default function HelpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const faqs = [
    { question: 'How do I create an invoice?', answer: 'Go to Invoices > Create Invoice and fill in the details' },
    { question: 'How do I track payments?', answer: 'Use the Payments section to record and track all payments' },
    { question: 'How do I generate GST reports?', answer: 'Navigate to GST Compliance to view and file GST forms' },
    { question: 'How do I manage inventory?', answer: 'Use the Inventory section to track stock levels' },
  ];

  const resources = [
    { title: 'Documentation', icon: '📚', description: 'Complete user guide and documentation' },
    { title: 'Video Tutorials', icon: '🎥', description: 'Step-by-step video tutorials' },
    { title: 'Contact Support', icon: '📞', description: 'Get in touch with our support team' },
    { title: 'Community Forum', icon: '💬', description: 'Connect with other users' },
  ];

  return (
    <VyapaarPage
      title="Help & Support"
      subtitle="Get help and support for GST Invoice SaaS"
      loading={loading}
    >
      {/* FAQs */}
      <Card className="mb-6">
        <CardHeader title="Frequently Asked Questions" subtitle="Common questions and answers" />
        <div className="space-y-4 p-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border-b pb-4" style={{ borderColor: 'var(--border-gray)' }}>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>{faq.question}</h3>
              <p className="text-sm" style={{ color: 'var(--text-gray)' }}>{faq.answer}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader title="Resources" subtitle="Help and support resources" />
        <div className="grid grid-cols-2 gap-4 p-6">
          {resources.map((resource, idx) => (
            <div key={idx} className="p-4 rounded-lg border" style={{ borderColor: 'var(--border-gray)' }}>
              <div className="text-3xl mb-2">{resource.icon}</div>
              <h3 className="font-semibold mb-1" style={{ color: 'var(--text-dark)' }}>{resource.title}</h3>
              <p className="text-xs mb-3" style={{ color: 'var(--text-gray)' }}>{resource.description}</p>
              <PrimaryButton className="w-full text-xs py-1">Learn More</PrimaryButton>
            </div>
          ))}
        </div>
      </Card>
    </VyapaarPage>
  );
}
