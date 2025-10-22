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

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: 1,
    question: 'How do I create an invoice?',
    answer: 'Go to Dashboard > Create Invoice. Fill in customer details, add items with quantities and rates, and click "Create Invoice". The system will auto-calculate GST based on the rates you set.'
  },
  {
    id: 2,
    question: 'What is GSTIN and why is it required?',
    answer: 'GSTIN (Goods and Services Tax Identification Number) is a 15-character unique identifier for GST registration in India. It\'s required for invoicing and GST compliance. You can find it in your GST registration certificate.'
  },
  {
    id: 3,
    question: 'How do I generate GSTR-1 reports?',
    answer: 'Go to Reports > GST Reports. Select the month and year, then click "Generate Report". GSTR-1 shows all your outward supplies (sales) for GST filing.'
  },
  {
    id: 4,
    question: 'Can I track inventory?',
    answer: 'Yes! Go to Dashboard > Inventory. You can track stock levels, set reorder points, and view stock movement history. The system alerts you when stock falls below the reorder level.'
  },
  {
    id: 5,
    question: 'How do I manage multiple users?',
    answer: 'Go to Dashboard > Users. Click "Invite User" and enter their email. You can assign different roles (Viewer, Accountant, Manager, Admin) with different permissions.'
  },
  {
    id: 6,
    question: 'How do I backup my data?',
    answer: 'Go to Dashboard > Backup & Export. Click "Create Backup Now" to create a full backup of your data. You can download backups anytime for safekeeping.'
  },
  {
    id: 7,
    question: 'What payment modes are supported?',
    answer: 'The system supports multiple payment modes including Cash, Cheque, Bank Transfer, Credit Card, Debit Card, UPI, and Digital Wallet. You can record payments against invoices.'
  },
  {
    id: 8,
    question: 'How do I create a Bill of Materials (BOM)?',
    answer: 'Go to Dashboard > Manufacturing > Bill of Materials. Click "Create BOM", enter the BOM name, select the finished product, and add raw materials with quantities.'
  }
];

const tutorials = [
  {
    title: 'Getting Started',
    description: 'Learn the basics of setting up your company and creating your first invoice',
    duration: '5 min',
    icon: '🚀'
  },
  {
    title: 'GST Compliance',
    description: 'Understand GST rates, GSTR reports, and how to stay compliant',
    duration: '10 min',
    icon: '📋'
  },
  {
    title: 'Inventory Management',
    description: 'Track stock levels, manage reorder points, and view stock movements',
    duration: '8 min',
    icon: '📦'
  },
  {
    title: 'Team Collaboration',
    description: 'Invite team members, assign roles, and manage permissions',
    duration: '6 min',
    icon: '👥'
  },
  {
    title: 'Reports & Analytics',
    description: 'Generate sales reports, profit & loss statements, and customer analytics',
    duration: '7 min',
    icon: '📊'
  },
  {
    title: 'Data Backup',
    description: 'Create backups, export data, and restore from backups',
    duration: '4 min',
    icon: '💾'
  }
];

export default function HelpPage() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'faq' | 'tutorials' | 'contact'>('faq');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          {[
            { id: 'faq', label: '❓ FAQ' },
            { id: 'tutorials', label: '🎓 Tutorials' },
            { id: 'contact', label: '📞 Contact Support' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    className="w-full px-6 py-4 text-left font-medium text-gray-900 hover:bg-gray-50 flex justify-between items-center"
                  >
                    {faq.question}
                    <span className={`transform transition-transform ${expandedFAQ === faq.id ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                  {expandedFAQ === faq.id && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-gray-700">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tutorials Tab */}
        {activeTab === 'tutorials' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Video Tutorials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutorials.map((tutorial, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
                  <div className="text-4xl mb-4">{tutorial.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{tutorial.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{tutorial.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">⏱️ {tutorial.duration}</span>
                    <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                      Watch →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Support Tab */}
        {activeTab === 'contact' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Contact Support</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Get in Touch</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">📧 Email</p>
                    <p className="text-gray-900 font-medium">support@invoicesaas.com</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">📞 Phone</p>
                    <p className="text-gray-900 font-medium">+91 1800-INVOICE</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">💬 Live Chat</p>
                    <p className="text-gray-900 font-medium">Available 9 AM - 6 PM IST</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">🌐 Website</p>
                    <p className="text-gray-900 font-medium">www.invoicesaas.com</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Send us a Message</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      type="text"
                      placeholder="How can we help?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      placeholder="Describe your issue..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

