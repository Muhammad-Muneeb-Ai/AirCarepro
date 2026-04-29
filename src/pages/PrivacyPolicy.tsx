import { motion } from 'motion/react';

export default function PrivacyPolicy() {
  const sections = [
    {
      title: "Information We Collect",
      content: "We collect information you provide directly to us, such as when you request a service, sign up for our newsletter, or contact us. This may include your name, email address, phone number, and service address."
    },
    {
      title: "How We Use Your Information",
      content: "We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to develop new products and services. We also use it to protect Apex Duct Cleaning and our users."
    },
    {
      title: "Cookies",
      content: "We use cookies and similar tracking technologies to track the activity on our service and hold certain information. Cookies are files with small amount of data which may include an anonymous unique identifier."
    },
    {
      title: "Data Security",
      content: "The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security."
    },
    {
      title: "Third-Party Sharing",
      content: "We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information unless we provide users with advance notice. This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or serving our users."
    },
    {
      title: "Your Rights",
      content: "You have the right to access, update or delete the information we have on you. Whenever made possible, you can access, update or request deletion of your personal information directly within your account settings section."
    },
    {
      title: "Contact Information",
      content: (
        <>
          If you have any questions about this Privacy Policy, please contact us at{" "}
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
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 tracking-tight">Privacy Policy</h1>
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
