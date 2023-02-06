import { Stripe, loadStripe } from '@stripe/stripe-js';

let stripePromise: Stripe | null;

export default async function() {
  if (!stripePromise) {
    stripePromise = await loadStripe(
      'pk_test_51MVnR5LCVjNRyPuJpkiXbveTEpgb0Z40spZhrWdqRc1UZx1M0jfSpCQMdLAnRfgrWBtocDrBPPNH7ZBJ6vcgE0YQ00qCfb6X7V'
    );
  }
  return stripePromise;
}