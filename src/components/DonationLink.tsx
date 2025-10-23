/**
 * Composant DonationLink - Affiche un lien pour soutenir le projet Zerah
 */
export default function DonationLink() {
  return (
    <div className="flex justify-center items-center gap-2 py-2 px-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg border border-red-200 dark:border-red-800">
      <span className="text-red-600 dark:text-red-400">❤️</span>
      <a
        href="https://www.paypal.com/donate/?hosted_button_id=8UTZKNRJKJGGS"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition underline"
      >
        Soutenir Zerah via PayPal
      </a>
    </div>
  );
}
