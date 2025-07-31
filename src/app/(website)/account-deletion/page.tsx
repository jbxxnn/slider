import React from "react";

const AccountDeletion = () => (
  <main className="max-w-2xl mx-auto py-12 px-4">
    <h1 className="text-3xl font-bold mb-6">Account Deletion</h1>
    <p className="mb-4">Last updated: July 2024</p>
    
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-2">How to Delete Your Account</h2>
      <p className="mb-4">
        To delete your SlideAi account, please follow these steps:
      </p>
      <ol className="list-decimal list-inside ml-4 space-y-2">
        <li>Log into your SlideAi account</li>
        <li>Go to your Account Settings</li>
        <li>Scroll down to the "Delete Account" section</li>
        <li>Click on "Delete My Account"</li>
        <li>Confirm your decision by typing "DELETE" in the confirmation field</li>
        <li>Click "Permanently Delete Account"</li>
      </ol>
    </section>

    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-2">What Happens When You Delete Your Account</h2>
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <p className="text-red-800 font-medium mb-2">⚠️ This action is permanent and cannot be undone.</p>
      </div>
      <ul className="list-disc list-inside ml-4 space-y-2">
        <li>All your personal data will be permanently deleted from our servers</li>
        <li>Your account and all associated information will be removed</li>
        <li>You will lose access to all your automations and integrations</li>
        <li>Any active subscriptions will be cancelled</li>
        <li>You will no longer receive any communications from SlideAi</li>
      </ul>
    </section>

    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-2">Data Retention</h2>
      <p className="mb-4">
        After account deletion, we may retain certain information for legal or regulatory purposes for a limited period, such as:
      </p>
      <ul className="list-disc list-inside ml-4 space-y-2">
        <li>Transaction records for tax and accounting purposes</li>
        <li>Information required by law enforcement or regulatory authorities</li>
        <li>Backup data that may be retained for a short period</li>
      </ul>
    </section>

    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-2">Need Help?</h2>
      <p className="mb-4">
        If you're having trouble deleting your account or have questions about the process, our support team is here to help.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">
          Contact us at <a href="mailto:support@slideai.com" className="underline font-medium">support@slideai.com</a> for assistance with account deletion.
        </p>
      </div>
    </section>

    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-2">Alternative Options</h2>
      <p className="mb-4">
        Before deleting your account, consider these alternatives:
      </p>
      <ul className="list-disc list-inside ml-4 space-y-2">
        <li><strong>Pause your account:</strong> Temporarily disable your account instead of deleting it</li>
        <li><strong>Export your data:</strong> Download your data before deletion</li>
        <li><strong>Contact support:</strong> We may be able to help resolve any issues you're experiencing</li>
      </ul>
    </section>

    <section>
      <h2 className="text-xl font-semibold mb-2">Contact Information</h2>
      <p>
        For any questions about account deletion or to request assistance, please contact us at{" "}
        <a href="mailto:support@slideai.com" className="text-blue-600 underline">support@slideai.com</a>.
      </p>
    </section>
  </main>
);

export default AccountDeletion; 