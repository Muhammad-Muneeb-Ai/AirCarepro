import { motion } from 'motion/react';

export default function TermsOfService() {
  const sections = [
    {
      title: "Acceptance of Terms",
      content: "By accessing or using Apex Duct Cleaning's services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing our services."
    },
    {
      title: "Service Description",
      content: "Apex Duct Cleaning provides professional air duct cleaning, HVAC restoration, and related indoor air quality services. We reserve the right to modify or discontinue any service at any time without notice."
    },
    {
      title: "Payment Terms",
      content: "Payment is due upon completion of services unless otherwise agreed upon in writing. We accept major credit cards, checks, and other approved payment methods. Late payments may be subject to interest charges."
    },
    {
      title: "Cancellation Policy",
      content: "Please provide at least 24 hours notice for cancellations or rescheduling. Cancellations made less than 24 hours before the scheduled service may be subject to a cancellation fee."
    },
    {
      title: "Limitation of Liability",
      content: "In no event shall Apex Duct Cleaning or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use our services."
    },
    {
      title: "Governing Law",
      content: "These terms and conditions are governed by and construed in accordance with the laws of the State of Texas, USA, and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location."
    },
    {
      title: "Contact",
      content: (
        <>
          If you have any questions about these Terms of Service, please contact us at{" "}
          <a href="mailto:info@aircarepro.com" className="text-[#0f3b5e] font-bold hover:underline transition-all">info@aircarepro.com</a> or{" "}
          <a href="tel:+18005550199" className="text-[#0f3b5e] font-bold hover:underline transition-all">(800) 555-0199</a>.
        </>
      )
    }
  ];

  return (
    <div className="pt-32 pb-24 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-16 rounded-[40px] shadow-xl border border-slate-100"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 tracking-tight">Terms of Service</h1>
          <p className="text-slate-500 mb-12">Last updated: April 2, 2026</p>

          <div className="space-y-12">
            {sections.map((section, index) => (
              <motion.section
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col gap-4"
              >
                <h2 className="text-2xl font-bold text-slate-900">{section.title}</h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  {section.content}
                </p>
              </motion.section>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
