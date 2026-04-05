'use client';

import { Mail, Phone, MapPin, MessageSquare, HelpCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Support Center
          </h1>
          <p className="text-lg text-gray-600">
            We're here to help! Get in touch with us through any of the channels below.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Email Support */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Email Us
            </h3>
            <p className="text-gray-600 mb-4">
              Send us an email and we'll respond within 24 hours.
            </p>
            <a
              href="mailto:support@ebkustsl.edu.sl"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              support@ebkustsl.edu.sl
            </a>
          </div>

          {/* Phone Support */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Call Us
            </h3>
            <p className="text-gray-600 mb-4">
              Available Monday - Friday, 8AM - 5PM WAT
            </p>
            <a
              href="tel:+23276000000"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              +232 76 000 000
            </a>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Visit Us
            </h3>
            <p className="text-gray-600 mb-4">
              Ernest Bai Koroma University of Science and Technology
            </p>
            <p className="text-purple-600 font-medium">
              Makeni, Sierra Leone
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-8 h-8 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How do I reset my password?
              </h3>
              <p className="text-gray-600">
                Click on "Forgot Password" on the login page and follow the instructions sent to your registered email address.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How do I check my payment status?
              </h3>
              <p className="text-gray-600">
                Log in to your student portal and navigate to the Payments section to view all your transaction history.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Who do I contact for technical issues?
              </h3>
              <p className="text-gray-600">
                For technical support, email support@ebkustsl.edu.sl or submit a ticket through the Help Desk portal.
              </p>
            </div>

            <div className="pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What are the office hours?
              </h3>
              <p className="text-gray-600">
                Our support team is available Monday through Friday, 8:00 AM to 5:00 PM West Africa Time (WAT).
              </p>
            </div>
          </div>
        </div>

        {/* Help Desk Link */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-center text-white">
          <MessageSquare className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            Need More Help?
          </h2>
          <p className="text-indigo-100 mb-6">
            Submit a support ticket and our team will get back to you as soon as possible.
          </p>
          <Link
            href="/login"
            className="inline-block bg-white text-indigo-600 font-semibold py-3 px-6 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            Log In to Submit Ticket
          </Link>
        </div>
      </div>
    </div>
  );
}
