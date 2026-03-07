import { useState, useEffect, useRef } from 'react';
import { Smartphone, Check, AlertCircle, Loader2, Globe, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Stepper } from './Stepper';
import type { VotePack } from '../lib/api';
import { ConfettiAnimation } from './ConfettiAnimation';
import { AnimatePresence, motion } from 'framer-motion';
import { payVote, payStripe, getPaymentStatus } from '../lib/api';

// Stripe
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Initialisation lazy — évite l'erreur "empty string" si la clé n'est pas définie
const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY as string | undefined;
const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null;

// ─── Styles Stripe Elements ────────────────────────────────────────────────────
const STRIPE_ELEMENT_STYLE = {
  base: {
    fontSize: '16px',
    color: '#1a1a2e',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    '::placeholder': { color: '#a0a0b0' },
    iconColor: '#1e40af',
  },
  invalid: { color: '#d4183d', iconColor: '#d4183d' },
};

// ─── Sous-composant formulaire carte Stripe ────────────────────────────────────
interface StripeCardFormProps {
  clientSecret: string;
  selectedPack: VotePack | undefined;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

function StripeCardForm({ clientSecret, selectedPack, onSuccess, onError }: StripeCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isConfirming, setIsConfirming] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ number?: string; expiry?: string; cvc?: string }>({});

  const handleConfirm = async () => {
    if (!stripe || !elements) return;
    if (!cardholderName.trim()) {
      onError('Veuillez saisir le nom du titulaire de la carte.');
      return;
    }

    setIsConfirming(true);

    const cardNumber = elements.getElement(CardNumberElement);
    if (!cardNumber) {
      onError('Élément carte introuvable.');
      setIsConfirming(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardNumber,
        billing_details: { name: cardholderName.trim() },
      },
    });

    if (error) {
      onError(error.message || 'Paiement refusé. Vérifiez vos informations.');
      setIsConfirming(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      onSuccess();
    } else {
      onError('Statut inattendu. Contactez le support.');
      setIsConfirming(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4"
    >
      

      {/* Résumé montant */}
      {/* <div className="rounded-xl border border-blue-100 dark:border-blue-900 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 p-4 mt-4 mb-4 flex justify-between items-center">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Pack sélectionné</p>
          <p className="font-bold">{selectedPack?.votes} vote{(selectedPack?.votes ?? 0) > 1 ? 's' : ''}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground mb-0.5">Total</p>
          <p className="font-bold text-[#1e40af] text-xl">{selectedPack?.price} FCFA</p>
        </div>
      </div> */}

      {/* Nom du titulaire */}
      <div className="flex flex-col gap-4">
        <Label htmlFor="cardholder">Nom du titulaire</Label>
        <Input
          id="cardholder"
          placeholder="JEAN DUPONT"
          className="h-12 uppercase tracking-wider text-base"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
        />
      </div>

      {/* Numéro de carte */}
      <div className="flex flex-col gap-4">
        <Label>Numéro de carte</Label>
        <div className="border border-input rounded-lg bg-background dark:bg-gray-800 px-3 py-3.5 focus-within:ring-2 focus-within:ring-[#635bff]/50 focus-within:border-[#635bff] transition-all">
          <CardNumberElement
            options={{ style: STRIPE_ELEMENT_STYLE, showIcon: true }}
            onChange={(e) => setFieldErrors((prev) => ({ ...prev, number: e.error?.message }))}
          />
        </div>
        {fieldErrors.number && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {fieldErrors.number}
          </p>
        )}
      </div>

      {/* Expiration + CVC */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <Label>Date d'expiration</Label>
          <div className="border border-input rounded-lg bg-background dark:bg-gray-800 px-3 py-3.5 focus-within:ring-2 focus-within:ring-[#635bff]/50 focus-within:border-[#635bff] transition-all">
            <CardExpiryElement
              options={{ style: STRIPE_ELEMENT_STYLE }}
              onChange={(e) => setFieldErrors((prev) => ({ ...prev, expiry: e.error?.message }))}
            />
          </div>
          {fieldErrors.expiry && (
            <p className="text-xs text-red-500">{fieldErrors.expiry}</p>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <Label>CVC</Label>
          <div className="border border-input rounded-lg bg-background dark:bg-gray-800 px-3 py-3.5 focus-within:ring-2 focus-within:ring-[#635bff]/50 focus-within:border-[#635bff] transition-all">
            <CardCvcElement
              options={{ style: STRIPE_ELEMENT_STYLE }}
              onChange={(e) => setFieldErrors((prev) => ({ ...prev, cvc: e.error?.message }))}
            />
          </div>
          {fieldErrors.cvc && (
            <p className="text-xs text-red-500">{fieldErrors.cvc}</p>
          )}
        </div>
      </div>

      {/* Cartes acceptées + sécurité */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-muted-foreground">Cartes :</span>
          {['VISA', 'MC', 'AMEX'].map((card) => (
            <span
              key={card}
              className="text-[10px] font-bold px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 tracking-wider"
            >
              {card}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Lock className="w-3 h-3 text-green-600" />
          <span>Sécurisé par <span className="font-semibold text-[#635bff]">Stripe</span></span>
        </div>
      </div>

      {/* Bouton confirmer */}
      <Button
        onClick={handleConfirm}
        disabled={isConfirming || !stripe}
        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#635bff] to-[#4f46e5] hover:from-[#4f46e5] hover:to-[#3730a3] text-white rounded-xl shadow-lg disabled:opacity-60"
      >
        {isConfirming ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Confirmation en cours...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Payer {selectedPack?.price} FCFA
          </>
        )}
      </Button>
    </motion.div>
  );
}

// ─── Props du modal principal ──────────────────────────────────────────────────
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string | null;
  votePacks: VotePack[];
  onSuccess: () => void;
}

// ─── Composant principal ───────────────────────────────────────────────────────
export function PaymentModal({
  isOpen,
  onClose,
  candidateId,
  votePacks,
  onSuccess,
}: PaymentModalProps) {
  const [step, setStep] = useState(1);
  const [selectedPackId, setSelectedPackId] = useState('single');

  // Méthode : 'orange' | 'mtn' | 'card'
  const [paymentProvider, setPaymentProvider] = useState<'orange' | 'mtn' | 'card'>('orange');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  // Référence mobile money (NotchPay) — distinct du paiement Stripe
  const [mobileReference, setMobileReference] = useState<string | null>(null);

  // Stripe — clientSecret retourné par le backend
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedPackId('single');
      setPhoneNumber('');
      setError(null);
      setShowConfetti(false);
      setIsLoading(false);
      setMobileReference(null);
      setStripeClientSecret(null);
      setPaymentProvider('orange');
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  }, [isOpen]);

  const selectedPack = votePacks.find((p) => p.id === selectedPackId);

  // ── Paiement Mobile Money (NotchPay) ─────────────────────────────────────────
  const handleMobileMoneyPayment = async () => {
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    const nineDigits = digitsOnly.startsWith('237') ? digitsOnly.slice(3, 12) : digitsOnly.slice(0, 9);
    if (!nineDigits.match(/^6[2-9]\d{7}$/)) {
      setError('Numéro invalide. Format: 6XXXXXXXX (ex. 690123456)');
      return;
    }
    if (!candidateId || !selectedPack) return;

    setError(null);
    setIsLoading(true);

    const channel = paymentProvider === 'mtn' ? 'cm.mtn' : 'cm.orange';
    const phone = `237${nineDigits}`;

    const data = await payVote({
      candidateId,
      packId: selectedPackId,
      amount: selectedPack.price,
      channel,
      phone,
    });

    if (!data.success || !data.reference) {
      setError(data.message || 'Erreur lors du paiement.');
      setIsLoading(false);
      return;
    }

    setMobileReference(data.reference);
    const ref = data.reference;
    const maxAttempts = 48;
    let attempts = 0;

    pollIntervalRef.current = setInterval(async () => {
      attempts += 1;
      const status = await getPaymentStatus(ref);
      if (!status) return;
      if (status.status === 'complete') {
        clearInterval(pollIntervalRef.current!);
        pollIntervalRef.current = null;
        setStep(3);
        setShowConfetti(true);
        onSuccess();
      }
      if (status.status === 'failed') {
        clearInterval(pollIntervalRef.current!);
        pollIntervalRef.current = null;
        setError('Paiement refusé. Vous pouvez réessayer.');
        setIsLoading(false);
        setMobileReference(null);
      }
      if (attempts >= maxAttempts) {
        clearInterval(pollIntervalRef.current!);
        pollIntervalRef.current = null;
        setError('Délai dépassé. Si vous avez confirmé sur votre téléphone, rechargez la page.');
        setIsLoading(false);
        setMobileReference(null);
      }
    }, 2500);

    setIsLoading(false);
  };

  // ── Initiation paiement Stripe (récupère clientSecret) ───────────────────────
  const handleStripeInit = async () => {
    if (!candidateId || !selectedPack) return;
    setError(null);
    setIsLoading(true);

    const data = await payStripe({
      candidateId,
      packId: selectedPackId,
      amount: selectedPack.price,
      currency: 'xaf',
    });

    if (!data.success || !data.clientSecret) {
      setError(data.message || 'Impossible d\'initialiser le paiement Stripe.');
      setIsLoading(false);
      return;
    }

    setStripeClientSecret(data.clientSecret);
    setIsLoading(false);
  };

  // ── Callback succès Stripe (appelé par StripeCardForm) ───────────────────────
  const handleStripeSuccess = () => {
    setStep(3);
    setShowConfetti(true);
    onSuccess();
  };

  // ── Continuer étape 1 → 2 ────────────────────────────────────────────────────
  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
      // Pré-init Stripe dès l'arrivée sur l'étape 2 si carte sélectionnée
      if (paymentProvider === 'card') {
        handleStripeInit();
      }
    }
  };

  // Quand on change de méthode sur l'étape 2 : reset complet de l'état de paiement
  const handleProviderChange = (v: 'orange' | 'mtn' | 'card') => {
    setPaymentProvider(v);
    setError(null);
    setMobileReference(null);
    setIsLoading(false);
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    // Réinitialiser Stripe si on revient à une méthode mobile
    if (v !== 'card') {
      setStripeClientSecret(null);
    }
    if (v === 'card' && step === 2 && !stripeClientSecret) {
      handleStripeInit();
    }
  };

  const steps = [
    { id: 1, label: 'Pack' },
    { id: 2, label: 'Paiement' },
    { id: 3, label: 'Succès' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg flex flex-col max-h-[92vh] dark:bg-gray-900/95 border-none shadow-2xl p-0 gap-0 overflow-hidden">
        {showConfetti && <ConfettiAnimation />}

        {/* En-tête fixe */}
        <div className="px-6 pt-6 pb-4 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              {step === 3 ? 'Félicitations! 🎉' : 'Effectuer un vote'}
            </DialogTitle>
            <DialogDescription className="text-center">
              {step === 3
                ? 'Votre vote a été enregistré avec succès.'
                : 'Choisissez un pack et votre mode de paiement.'}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Stepper steps={steps} currentStep={step} />
          </div>
        </div>

        {/* Corps scrollable */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
        <AnimatePresence mode="wait">
          {/* ─── ÉTAPE 1 : Choix du pack ─────────────────────────────────── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-3">
                {votePacks.map((pack) => (
                  <div
                    key={pack.id}
                    onClick={() => setSelectedPackId(pack.id)}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPackId === pack.id
                        ? 'border-[#1e40af] bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                  >
                    {pack.popular && (
                      <span className="absolute top-2 right-4 bg-[#fbbf24] text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                        Populaire
                      </span>
                    )}
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-lg">{pack.votes} Vote{pack.votes > 1 ? 's' : ''}</p>
                        <p className="text-sm text-muted-foreground">Pack standard</p>
                      </div>
                      <p className="font-bold text-[#1e40af] text-lg">{pack.price} FCFA</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={handleNextStep} className="w-full h-12 text-base mt-2 bg-[#1e40af] hover:bg-[#1e3a8a]">
                Continuer
              </Button>
            </motion.div>
          )}

          {/* ─── ÉTAPE 2 : Paiement ──────────────────────────────────────── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-4"
            >
              {/* Onglets méthode */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'orange', label: 'Orange Money', emoji: '🟠', activeColor: 'border-[#ff7900] bg-orange-50 dark:bg-orange-950/20' },
                  { key: 'mtn', label: 'MTN MoMo', emoji: '🟡', activeColor: 'border-[#ffcc00] bg-yellow-50 dark:bg-yellow-950/20' },
                  { key: 'card', label: 'Carte', icon: <Globe className="w-4 h-4 text-[#635bff]" />, activeColor: 'border-[#635bff] bg-indigo-50 dark:bg-indigo-950/20' },
                ].map((method) => (
                  <button
                    type="button"
                    key={method.key}
                    onClick={() => handleProviderChange(method.key as 'orange' | 'mtn' | 'card')}
                    className={`flex flex-col items-center gap-4 p-4 rounded-xl border-2 transition-all text-xs font-medium ${
                      paymentProvider === method.key
                        ? method.activeColor
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {'emoji' in method ? <span>{method.emoji}</span> : method.icon}
                    <span className="text-center leading-tight">{method.label}</span>
                  </button>
                ))}
              </div>

              {/* ── FORMULAIRE MOBILE MONEY ── */}
              {(paymentProvider === 'orange' || paymentProvider === 'mtn') && (
                <div className="flex flex-col gap-3">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 mb-4 rounded-lg flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total à payer</span>
                    <span className="font-bold text-xl">{selectedPack?.price} FCFA</span>
                  </div>

                  <div className="flex flex-col gap-4">
                    <Label htmlFor="phone">Numéro {paymentProvider === 'orange' ? 'Orange' : 'MTN'}</Label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="6XXXXXXXX ou 237 6XXXXXXXX"
                        className="pl-10 h-11"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 12));
                          setError(null);
                        }}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {mobileReference ? (
                    <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-4 text-center space-y-2">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#1e40af]" />
                      <p className="font-medium text-sm">Paiement envoyé !</p>
                      <p className="text-xs text-muted-foreground">
                        Confirmez la transaction sur votre téléphone. Mise à jour automatique.
                      </p>
                      {error && <p className="text-xs text-red-500">{error}</p>}
                    </div>
                  ) : (
                    <div className="flex gap-3 pt-1">
                      <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 h-11">
                        Retour
                      </Button>
                      <Button
                        type="button"
                        onClick={handleMobileMoneyPayment}
                        disabled={isLoading || !phoneNumber}
                      >
                        {isLoading ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Traitement...</>
                        ) : (
                          <><Smartphone className="w-4 h-4 mr-2" />Payer {selectedPack?.price} FCFA</>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* ── FORMULAIRE CARTE STRIPE ── */}
              {paymentProvider === 'card' && (
                <AnimatePresence mode="wait">
                  {isLoading && !stripeClientSecret ? (
                    <motion.div
                      key="stripe-loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center gap-3 py-8"
                    >
                      <Loader2 className="w-8 h-8 animate-spin text-[#635bff]" />
                      <p className="text-sm text-muted-foreground">Initialisation du paiement sécurisé...</p>
                    </motion.div>
                  ) : stripeClientSecret ? (
                    <motion.div key="stripe-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                      {error && (
                        <div className="flex items-center gap-2 text-red-500 text-sm mb-4">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}
                      {stripePromise ? (
                        <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret }}>
                          <StripeCardForm
                            clientSecret={stripeClientSecret}
                            selectedPack={selectedPack}
                            onSuccess={handleStripeSuccess}
                            onError={(msg) => setError(msg)}
                          />
                        </Elements>
                      ) : (
                        <div className="flex items-center gap-2 text-red-500 text-sm">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Clé Stripe manquante (VITE_STRIPE_PUBLIC_KEY non définie).</span>
                        </div>
                      )}
                      <Button variant="outline" onClick={() => setStep(1)} className="w-full mt-3 h-10">
                        ← Retour au choix du pack
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div key="stripe-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                      {error && (
                        <div className="flex items-center gap-2 text-red-500 text-sm">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}
                      <Button onClick={handleStripeInit} className="w-full h-12 bg-[#635bff] hover:bg-[#4f46e5]">
                        Réessayer
                      </Button>
                      <Button variant="outline" onClick={() => setStep(1)} className="w-full h-10">
                        Retour
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </motion.div>
          )}

          {/* ─── ÉTAPE 3 : Succès ────────────────────────────────────────── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto"
              >
                <Check className="w-10 h-10 text-green-600" />
              </motion.div>

              <div>
                <h3 className="text-xl font-bold mb-2">Vote Enregistré !</h3>
                <p className="text-muted-foreground text-sm">
                  Merci pour votre soutien. Vos {selectedPack?.votes} vote{(selectedPack?.votes ?? 0) > 1 ? 's' : ''} ont été ajoutés.
                </p>
              </div>

              <Button onClick={onClose} className="w-full h-12 bg-green-600 hover:bg-green-700">
                Fermer
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        </div>{/* fin corps scrollable */}
      </DialogContent>
    </Dialog>
  );
}