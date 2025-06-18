import { AppHeader } from "../_components/layout/appheader";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - DragnChat",
  description: "Privacy Policy for DragnChat application",
};

export default async function PrivacyPage() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <main className="bg-background min-h-screen">
      <AppHeader isSignedIn={isSignedIn} showProjectSelector={false} />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="text-primary hover:text-primary/80 mb-4 inline-flex items-center text-sm"
          >
            ← Back to App
          </Link>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="mb-2 text-3xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Introduction</h2>
            <p className="mb-4">
              Welcome to DragnChat. We respect your privacy and are committed to
              protecting your personal data. This privacy policy explains how we
              collect, use, and safeguard your information when you use our
              service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">
              Information We Collect
            </h2>
            <h3 className="mb-2 text-xl font-medium">Personal Information</h3>
            <ul className="mb-4 list-disc pl-6">
              <li>Account information (email, username)</li>
              <li>Profile information you choose to provide</li>
              <li>Communication preferences</li>
            </ul>

            <h3 className="mb-2 text-xl font-medium">Usage Information</h3>
            <ul className="mb-4 list-disc pl-6">
              <li>How you interact with our service</li>
              <li>Features you use and time spent</li>
              <li>Device and browser information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">
              How We Use Your Information
            </h2>
            <ul className="mb-4 list-disc pl-6">
              <li>Provide and maintain our service</li>
              <li>Improve user experience</li>
              <li>Send important updates and notifications</li>
              <li>Ensure security and prevent fraud</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Data Sharing</h2>
            <p className="mb-4">
              We do not sell, trade, or rent your personal information to third
              parties. We may share information only in these circumstances:
            </p>
            <ul className="mb-4 list-disc pl-6">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and safety</li>
              <li>
                With trusted service providers who assist in operating our
                service
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Data Security</h2>
            <p className="mb-4">
              We implement appropriate security measures to protect your
              personal information against unauthorized access, alteration,
              disclosure, or destruction. However, no method of transmission
              over the internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="mb-4 list-disc pl-6">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and data</li>
              <li>Object to processing of your data</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Cookies</h2>
            <p className="mb-4">
              We use cookies and similar technologies to enhance your
              experience, analyze usage, and provide personalized content. You
              can control cookie settings through your browser preferences.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">
              Changes to This Policy
            </h2>
            <p className="mb-4">
              We may update this privacy policy from time to time. We will
              notify you of any changes by posting the new policy on this page
              and updating the &ldquo;Last updated&rdquo; date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this privacy policy or our data
              practices, please contact us through our support channels.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
