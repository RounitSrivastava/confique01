import React from "react";

const TermsPage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-gray-200">

      <div className="sticky top-0 z-50 bg-indigo-950/90 border-b border-indigo-700 px-6 py-3 backdrop-blur">
        <p className="text-indigo-200 text-xs tracking-widest uppercase text-center">
          ⚠️ LEGALLY BINDING — GOVERNED BY INDIAN LAW — USER ASSUMES ALL RISK ⚠️
        </p>
      </div>

      <section className="mx-auto w-full max-w-4xl px-6 sm:px-10 py-20">

        <div className="mb-16">
          <h1 className="text-5xl font-bold text-white tracking-tight mb-4">
            Terms & Conditions
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl">
            This document constitutes a legally binding agreement between you and Confique under the laws of India. By using this platform, you acknowledge that you have read, understood, and accepted these Terms in full.
          </p>
        </div>

        <div className="mb-16 border border-indigo-800 bg-indigo-950/40 rounded-lg p-6">
          <h2 className="text-white font-semibold mb-3 uppercase tracking-wide">
            ⚠️ Extreme Legal Notice
          </h2>
          <p className="text-sm text-gray-300 leading-7">
            Confique is only a technology platform. We do not organize, supervise, verify, control, or guarantee any communities, events, content, organizers, or users.  
            <br /><br />
            Every interaction, transaction, participation, or communication you engage in through Confique is undertaken entirely at your own risk.
          </p>
        </div>

        <div className="space-y-16 text-sm leading-7">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              1. Acceptance & Legal Binding
            </h2>
            <p>
              By accessing or using Confique in any manner, you enter into a legally enforceable contract with Confique. If you do not agree to these Terms, you are strictly prohibited from using this platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              2. Eligibility & Capacity
            </h2>
            <p>
              You represent and warrant that you are at least sixteen (16) years of age and legally capable of entering into binding agreements under Indian law. Any misuse by a minor is the sole responsibility of the guardian.
            </p>
          </section>

          <section className="border-l-4 border-indigo-700 pl-6">
            <h2 className="text-xl font-semibold text-white mb-3">
              3. Account Security & Absolute Responsibility
            </h2>
            <p>
              You are solely and entirely responsible for all activity performed through your account, whether authorized or not. Confique shall not be liable for account misuse, hacking, impersonation, or data compromise.
            </p>
          </section>

          <section className="bg-zinc-950 border border-indigo-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-3">
              ⚠️ Community Conduct & Zero Liability
            </h2>
            <p>
              Confique does not moderate, monitor, endorse, or control any user-generated content or interactions. All risks, disputes, damages, or losses arising from community participation rest solely with the users involved.
            </p>
          </section>

          <section className="border border-zinc-800 rounded-lg p-6 bg-zinc-900/40">
            <h2 className="text-xl font-semibold text-white mb-3">
              4. Events — Complete Assumption of Risk
            </h2>
            <p>
              Confique is not an event organizer or safety authority. All physical, financial, legal, and personal risks related to events are borne entirely by attendees and organizers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              5. Content License
            </h2>
            <p>
              You grant Confique a perpetual, worldwide, royalty-free right to use, host, modify, and display any content you submit for platform operations and legal compliance.
            </p>
          </section>

          <section className="bg-indigo-950/30 border border-indigo-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-3">
              ⚖️ Indian IT Act & Law Enforcement
            </h2>
            <p>
              Confique complies with the Information Technology Act, 2000 and reserves the right to disclose user data to law enforcement or courts without notice when legally required.
            </p>
          </section>

          <section className="border-l-4 border-indigo-700 pl-6">
            <h2 className="text-xl font-semibold text-white mb-3">
              6. Suspension & Termination
            </h2>
            <p>
              Confique may suspend or permanently terminate any account at its sole discretion without prior notice, for any legal, safety, or operational reason.
            </p>
          </section>

          <section className="bg-indigo-950/30 border border-indigo-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-3">
              7. Disclaimer & Liability
            </h2>
            <p>
              Confique shall not be liable for any direct, indirect, incidental, or consequential damages arising from platform use, events, or user interactions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              8. Governing Law 🇮🇳
            </h2>
            <p>
              These Terms are governed exclusively by the laws of India. All disputes shall be resolved in Indian courts only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              9. Contact
            </h2>
            <p className="text-gray-400">
              Legal inquiries: <span className="text-white">confique01@gmail.com</span>
            </p>
          </section>

        </div>
      </section>
    </main>
  );
};

export default TermsPage;
