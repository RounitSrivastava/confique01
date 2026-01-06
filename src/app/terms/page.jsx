// src/pages/TermsPage.jsx
import React from "react";

const TermsPage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-gray-200">

      {/* TOP WARNING BAR */}
      <div className="sticky top-0 z-50 bg-red-900/90 border-b border-red-700 px-6 py-3">
        <p className="text-red-200 text-xs tracking-widest uppercase text-center">
          ⚠️ LEGALLY BINDING — GOVERNED BY INDIAN LAW — USER ASSUMES ALL RISK ⚠️
        </p>
      </div>

      <section className="mx-auto w-full max-w-4xl px-6 sm:px-10 py-20">

        {/* HEADER */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold text-red-500 tracking-tight mb-4">
            Terms & Conditions
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl">
            This document constitutes a legally enforceable agreement under
            applicable laws of India. Please read carefully. Ignorance of these
            Terms does not exempt you from liability.
          </p>
        </div>

        {/* EXTREME WARNING */}
        <div className="mb-16 border border-red-800 bg-red-950/40 rounded-lg p-6">
          <h2 className="text-red-400 font-semibold mb-3 uppercase tracking-wide">
            ⚠️ Extreme Legal Notice
          </h2>
          <p className="text-sm text-gray-300 leading-7">
            Confique is a student community and event-hosting platform that merely
            provides digital infrastructure. Confique does not control, verify,
            supervise, or guarantee users, communities, content, or events.
            All participation is voluntary and strictly at your own risk.
          </p>
        </div>

        {/* CONTENT */}
        <div className="space-y-16 text-sm leading-7">

          {/* ACCEPTANCE */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              1. Acceptance & Legal Binding
            </h2>
            <p>
              By accessing, registering, hosting events, joining communities,
              posting content, or otherwise using Confique, you irrevocably agree
              to be bound by these Terms. If you do not agree, you must immediately
              discontinue all use of the Platform.
            </p>
          </section>

          {/* ELIGIBILITY */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              2. Eligibility & Capacity
            </h2>
            <p>
              You confirm that you are at least sixteen (16) years of age and legally
              competent to enter into binding contracts under Indian law. If acting
              on behalf of any organization, you personally guarantee authorization
              and accept full responsibility.
            </p>
          </section>

          {/* ACCOUNT */}
          <section className="border-l-4 border-red-700 pl-6">
            <h2 className="text-xl font-semibold text-red-400 mb-3">
              3. Account Security & Absolute Responsibility
            </h2>
            <p>
              You are solely responsible for safeguarding your login credentials
              and for all actions performed through your account. Confique shall
              not be liable for impersonation, misuse, unauthorized access, or
              resulting damages under any circumstances.
            </p>
          </section>

          {/* COMMUNITY RULES */}
          <section className="bg-zinc-950 border border-red-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-red-400 mb-3">
              ⚠️ Community Conduct, Misbehavior & Zero Liability
            </h2>

            <p>
              Confique provides community spaces solely as a neutral communication
              platform. Confique does not monitor, moderate, pre-screen, endorse,
              or control user conduct, discussions, or shared content.
            </p>

            <p className="mt-3">
              Any misbehavior, harassment, abuse, threats, defamation, fraud,
              misinformation, hate speech, illegal activity, or harmful conduct
              shall be considered the sole and exclusive responsibility of the
              involved users.
            </p>

            <ul className="mt-4 list-disc pl-6 space-y-2 text-gray-400">
              <li>No responsibility for emotional, physical, or financial harm</li>
              <li>No responsibility for disputes or conflicts between users</li>
              <li>No guarantee of safety, accuracy, or legality of content</li>
              <li>No responsibility for offline consequences of online interaction</li>
            </ul>

            <p className="mt-4 text-red-300">
              Participation in any community is entirely voluntary and undertaken
              strictly at your own risk.
            </p>

            <p className="mt-3 text-xs text-gray-400">
              Confique reserves the right—but assumes no obligation—to remove content
              or restrict access. Failure to act does not imply responsibility.
            </p>
          </section>

          {/* EVENTS */}
          <section className="border border-zinc-800 rounded-lg p-6 bg-zinc-900/40">
            <h2 className="text-xl font-semibold text-red-400 mb-3">
              4. Events — Complete Assumption of Risk
            </h2>
            <p>
              Confique is not an event organizer, sponsor, co-host, or safety authority.
              All events are hosted and attended entirely at the user’s own risk.
            </p>

            <ul className="mt-4 list-disc pl-6 space-y-2 text-gray-400">
              <li>Injury, illness, or death</li>
              <li>Financial loss, theft, or fraud</li>
              <li>Legal violations or penalties</li>
              <li>Misconduct by organizers or attendees</li>
            </ul>

            <p className="mt-4 text-red-300">
              Event organizers bear full responsibility for legal compliance,
              safety, permissions, and regulatory approvals.
            </p>
          </section>

          {/* CONTENT */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              5. Content License
            </h2>
            <p>
              By submitting content, you grant Confique a perpetual, worldwide,
              royalty-free, sublicensable license to host, display, modify, and
              distribute such content for platform operations.
            </p>
          </section>

          {/* IT ACT & LAW ENFORCEMENT */}
          <section className="bg-red-950/30 border border-red-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-red-400 mb-3">
              ⚖️ Indian IT Act, 2000 & Law Enforcement Cooperation
            </h2>
            <p>
              Confique operates in accordance with the Information Technology Act,
              2000 and applicable rules thereunder. Confique shall not be held liable
              for user-generated content under Section 79 of the IT Act.
            </p>
            <p className="mt-3">
              Confique reserves the right to cooperate with law enforcement agencies,
              courts, or government authorities and may disclose user information,
              content, or activity logs without notice where required by law.
            </p>
          </section>

          {/* TERMINATION */}
          <section className="border-l-4 border-red-700 pl-6">
            <h2 className="text-xl font-semibold text-red-400 mb-3">
              6. Suspension & Termination Without Notice
            </h2>
            <p>
              Confique may suspend or terminate any account at its sole discretion,
              without notice, for violations, legal risks, or platform integrity
              concerns.
            </p>
          </section>

          {/* LIABILITY */}
          <section className="bg-red-950/30 border border-red-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-red-400 mb-3">
              7. Disclaimer, Limitation & Indemnification
            </h2>
            <p>
              The Platform is provided “AS IS” and “AS AVAILABLE.” Confique disclaims
              all warranties and shall not be liable for any damages arising from
              platform use, events, or community interactions.
            </p>
            <p className="mt-3">
              You agree to indemnify and hold harmless Confique from any claims,
              losses, liabilities, or legal proceedings arising from your actions.
            </p>
          </section>

          {/* JURISDICTION */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              8. Governing Law & Jurisdiction 🇮🇳
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the
              laws of India. All disputes shall be subject to the exclusive
              jurisdiction of courts located in India.
            </p>
          </section>

          {/* CONTACT */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              9. Contact
            </h2>
            <p className="text-gray-400">
              Legal inquiries: <span className="text-white">support@confique.com</span>
            </p>
          </section>

        </div>
      </section>
    </main>
  );
};

export default TermsPage;
