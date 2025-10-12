// src/pages/TermsPage.jsx
import React from "react";

const TermsPage = () => {
  return (
    <main className="min-h-screen bg-black text-gray-200">
      <section className="mx-auto w-full max-w-3xl px-6 sm:px-8 lg:px-10 py-16">
        <h1 className="text-4xl font-semibold tracking-tight text-white mb-8">
          Terms & Conditions
        </h1>

        <div className="space-y-10 text-gray-300 leading-7">
          <section>
            <h2 className="text-2xl font-medium text-gray-100 mb-3">Introduction</h2>
            <p>
              Welcome to <span className="font-medium text-gray-100">EventHub</span>, a community-based event hosting and networking platform. By accessing or using the Platform, agreement to these Terms & Conditions is required. 
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-gray-100 mb-3">Eligibility</h2>
            <p>
              Users must be at least <span className="font-medium">16 years old</span> to create an account. When registering on behalf of an organization, it is confirmed that authority exists to act for that entity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-gray-100 mb-3">Account Security</h2>
            <p>
              Users are responsible for safeguarding login credentials and all activities under their accounts. Suspicion of unauthorized use should trigger immediate notification.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-gray-100 mb-3">Community Guidelines</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>No offensive, harmful, or illegal content.</li>
              <li>No harassment, bullying, or discrimination.</li>
              <li>No impersonation or misrepresentation.</li>
              <li>No spam, scams, or malicious activities.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-gray-100 mb-3">Events & Groups</h2>
            <p>
              Public events are visible to all users, while private or organization-only events are limited to verified members. Organizers are responsible for legality and safety.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-gray-100 mb-3">Content Ownership</h2>
            <p>
              Content ownership remains with the creator, with a <span className="font-medium">non-exclusive license</span> granted to display it on the Platform. Content that violates these Terms may be removed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-gray-100 mb-3">Privacy</h2>
            <p>
              Privacy is respected. Data is collected only to provide services and will not be sold to third parties without consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-gray-100 mb-3">Termination</h2>
            <p>
              Accounts that violate these Terms or disrupt the Platform’s integrity may be suspended or terminated.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-gray-100 mb-3">Limitation of Liability</h2>
            <p>
              The Platform is provided “as is.” Liability is not accepted for damages or disputes arising from user interactions or third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-gray-100 mb-3">Changes to Terms</h2>
            <p>
              Terms may be revised occasionally. Continued use after updates indicates acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium text-gray-100 mb-3">Contact Us</h2>
            <p>
              For questions, contact: <span className="text-gray-100">support@eventhub.com</span>
            </p>
          </section>
        </div>
      </section>
    </main>
  );
};

export default TermsPage;
