import { AppHeader } from "../_components/layout/appheader";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export const metadata = {
  title: "Terms of Service - DragnChat",
  description: "Terms of Service for DragnChat application",
};

export default async function TermsPage() {
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
          <h1 className="mb-2 text-3xl font-bold">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Agreement to Terms</h2>
            <p className="mb-4">
              By accessing and using DragnChat, you accept and agree to be bound
              by the terms and provision of this agreement. If you do not agree
              to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">
              Description of Service
            </h2>
            <p className="mb-4">
              DragnChat is a drag-and-drop node-based chat application that
              integrates with OpenRouter LLMs. We provide tools for creating and
              managing conversational AI workflows through an intuitive visual
              interface.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">User Accounts</h2>
            <ul className="mb-4 list-disc pl-6">
              <li>
                You are responsible for maintaining the confidentiality of your
                account credentials
              </li>
              <li>
                You are responsible for all activities that occur under your
                account
              </li>
              <li>
                You must provide accurate and complete information when creating
                an account
              </li>
              <li>
                You must notify us immediately of any unauthorized use of your
                account
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Acceptable Use</h2>
            <p className="mb-4">You agree not to use the service to:</p>
            <ul className="mb-4 list-disc pl-6">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on the rights of others</li>
              <li>Transmit harmful, offensive, or inappropriate content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>
                Use the service for any commercial purpose without permission
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Content and Data</h2>
            <ul className="mb-4 list-disc pl-6">
              <li>
                You retain ownership of content you create using our service
              </li>
              <li>
                You grant us a license to use your content as necessary to
                provide the service
              </li>
              <li>You are responsible for the content you create and share</li>
              <li>
                We reserve the right to remove content that violates these terms
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">
              Third-Party Services
            </h2>
            <p className="mb-4">
              Our service integrates with third-party services including
              OpenRouter and various LLM providers. Your use of these services
              is subject to their respective terms and conditions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">
              Service Availability
            </h2>
            <ul className="mb-4 list-disc pl-6">
              <li>
                We strive to maintain high service availability but cannot
                guarantee uninterrupted access
              </li>
              <li>
                We may temporarily suspend service for maintenance or updates
              </li>
              <li>
                We reserve the right to modify or discontinue features with
                notice
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">
              Limitation of Liability
            </h2>
            <p className="mb-4">
              To the fullest extent permitted by law, DragnChat shall not be
              liable for any indirect, incidental, special, consequential, or
              punitive damages, or any loss of profits or revenues, whether
              incurred directly or indirectly, or any loss of data, use,
              goodwill, or other intangible losses.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">
              Disclaimer of Warranties
            </h2>
            <p className="mb-4">
              The service is provided &ldquo;as is&rdquo; and &ldquo;as
              available&rdquo; without warranties of any kind, either express or
              implied, including but not limited to implied warranties of
              merchantability, fitness for a particular purpose, or
              non-infringement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Termination</h2>
            <ul className="mb-4 list-disc pl-6">
              <li>You may terminate your account at any time</li>
              <li>
                We may terminate or suspend your account for violations of these
                terms
              </li>
              <li>
                Upon termination, your right to use the service ceases
                immediately
              </li>
              <li>
                We may retain certain information as required by law or for
                legitimate business purposes
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify these terms at any time. We will
              notify users of any material changes. Your continued use of the
              service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Governing Law</h2>
            <p className="mb-4">
              These terms shall be governed by and construed in accordance with
              applicable laws, without regard to conflict of law principles.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Contact Information</h2>
            <p className="mb-4">
              If you have any questions about these Terms of Service, please
              contact us through our support channels.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
