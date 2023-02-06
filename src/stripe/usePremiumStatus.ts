import { User } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { authInstance } from '../firebase';

export default function(user: User | null) {
  const [premiumStatus, setPremiumStatus] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const checkPremiumStatus = async () => {
        setPremiumStatus(await getPremiumStatus());
      };
      checkPremiumStatus();
    }
  }, [user]);

  return premiumStatus;
}

async function getPremiumStatus(): Promise<string> {
  await authInstance.currentUser?.getIdToken(true);
  const decodedToken = await authInstance.currentUser?.getIdTokenResult();

  return decodedToken?.claims?.stripeRole;
}
