import { useState, useEffect, useRef } from 'react';
import { Smartphone, CreditCard, Check, AlertCircle, Loader2, Globe, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
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

// Clé publique Stripe (variable d'env Vite)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

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
  reference: string;
  selectedPack: VotePack | undefined;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

function StripeCardForm({ clientSecret, reference, selectedPack, onSuccess, onError }: StripeCardFormProps) {
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
      className="space-y-5"
    >
      {/* Résumé montant */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 border border-blue-100 dark:border-blue-900 rounded-xl p-4 flex justify-between items-center">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Pack sélectionné</p>
          <p className="font-bold">{selectedPack?.votes} vote{(selectedPack?.votes ?? 0) > 1 ? 's' : ''}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground mb-0.5">Total</p>
          <p className="font-bold text-[#1e40af] text-xl">{selectedPack?.price} FCFA</p>
        </div>
      </div>

      {/* Badge sécurité */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
        <Lock className="w-3 h-3 text-green-600 flex-shrink-0" />
        <span>Paiement sécurisé par <span className="font-semibold text-[#635bff]">Stripe</span> — vos données ne sont jamais stockées</span>
      </div>

      {/* Nom du titulaire */}
      <div className="space-y-1.5">
        <Label htmlFor="cardholder">Nom du titulaire</Label>
        <Input
          id="cardholder"
          placeholder="JEAN DUPONT"
          className="h-11 uppercase tracking-wider"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
        />
      </div>

      {/* Numéro de carte */}
      <div className="space-y-1.5">
        <Label>Numéro de carte</Label>
        <div className="relative">
          <div className="border rounded-md bg-input-background dark:bg-input/30 px-3 py-3 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-all">
            <CardNumberElement
              options={{ style: STRIPE_ELEMENT_STYLE, showIcon: true }}
              onChange={(e) => setFieldErrors((prev) => ({ ...prev, number: e.error?.message }))}
            />
          </div>
          {fieldErrors.number && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {fieldErrors.number}
            </p>
          )}
        </div>
      </div>

      {/* Expiration + CVC */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Date d'expiration</Label>
          <div className="border rounded-md bg-input-background dark:bg-input/30 px-3 py-3 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-all">
            <CardExpiryElement
              options={{ style: STRIPE_ELEMENT_STYLE }}
              onChange={(e) => setFieldErrors((prev) => ({ ...prev, expiry: e.error?.message }))}
            />
          </div>
          {fieldErrors.expiry && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.expiry}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>CVC</Label>
          <div className="border rounded-md bg-input-background dark:bg-input/30 px-3 py-3 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-all">
            <CardCvcElement
              options={{ style: STRIPE_ELEMENT_STYLE }}
              onChange={(e) => setFieldErrors((prev) => ({ ...prev, cvc: e.error?.message }))}
            />
          </div>
          {fieldErrors.cvc && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.cvc}</p>
          )}
        </div>
      </div>

      {/* Logos cartes acceptées */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Cartes acceptées :</span>
        {['VISA', 'MC', 'AMEX'].map((card) => (
          <span
            key={card}
            className="text-[10px] font-bold px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 tracking-wider"
          >
            {card}
          </span>
        ))}
      </div>

      {/* Bouton confirmer */}
      <Button
        onClick={handleConfirm}
        disabled={isConfirming || !stripe}
        className="w-full h-13 text-base font-semibold bg-gradient-to-r from-[#635bff] to-[#4f46e5] hover:from-[#4f46e5] hover:to-[#3730a3] text-white rounded-xl shadow-lg disabled:opacity-60"
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
  const [paymentReference, setPaymentReference] = useState<string | null>(null);

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
      setPaymentReference(null);
      setStripeClientSecret(null);
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

    setPaymentReference(data.reference);
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
        setPaymentReference(null);
      }
      if (attempts >= maxAttempts) {
        clearInterval(pollIntervalRef.current!);
        pollIntervalRef.current = null;
        setError('Délai dépassé. Si vous avez confirmé sur votre téléphone, rechargez la page.');
        setIsLoading(false);
        setPaymentReference(null);
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
    setPaymentReference(data.reference ?? null);
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

  // Quand on change de méthode sur l'étape 2, reset stripe si besoin
  const handleProviderChange = (v: 'orange' | 'mtn' | 'card') => {
    setPaymentProvider(v);
    setError(null);
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
      <DialogContent className="sm:max-w-md md:max-w-lg max-h-[92vh] overflow-y-auto dark:bg-gray-900/95 border-none shadow-2xl p-6 gap-6">
        {showConfetti && <ConfettiAnimation />}

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

        <div className="py-2">
          <Stepper steps={steps} currentStep={step} />
        </div>

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

              {/* Choix méthode sur étape 1 (preview) */}
              <div className="mt-2">
                <p className="text-sm font-medium text-muted-foreground mb-3">Moyen de paiement</p>
                <div className="grid grid-cols-3 gap-2">
                  {/* Orange Money */}
                  <button
                    onClick={() => setPaymentProvider('orange')}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                      paymentProvider === 'orange'
                        ? 'border-[#ff7900] bg-orange-50 dark:bg-orange-950/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
                    }`}
                  >
                    <span className="text-lg">🟠</span>
                    <span className="text-xs text-center leading-tight">Orange Money</span>
                  </button>
                  {/* MTN MoMo */}
                  <button
                    onClick={() => setPaymentProvider('mtn')}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                      paymentProvider === 'mtn'
                        ? 'border-[#ffcc00] bg-yellow-50 dark:bg-yellow-950/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-yellow-300'
                    }`}
                  >
                    <span className="text-lg">🟡</span>
                    <span className="text-xs text-center leading-tight">MTN MoMo</span>
                  </button>
                  {/* Carte bancaire */}
                  <button
                    onClick={() => setPaymentProvider('card')}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                      paymentProvider === 'card'
                        ? 'border-[#635bff] bg-indigo-50 dark:bg-indigo-950/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                    }`}
                  >
                    <Globe className="w-5 h-5 text-[#635bff]" />
                    <span className="text-xs text-center leading-tight">Carte Visa/MC</span>
                  </button>
                </div>
              </div>

              <Button onClick={handleNextStep} className="w-full h-12 text-base mt-4 bg-[#1e40af] hover:bg-[#1e3a8a]">
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
              className="space-y-5"
            >
              {/* Onglets méthode */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'orange', label: 'Orange Money', emoji: '🟠', activeColor: 'border-[#ff7900] bg-orange-50 dark:bg-orange-950/20' },
                  { key: 'mtn', label: 'MTN MoMo', emoji: '🟡', activeColor: 'border-[#ffcc00] bg-yellow-50 dark:bg-yellow-950/20' },
                  { key: 'card', label: 'Carte', icon: <Globe className="w-4 h-4 text-[#635bff]" />, activeColor: 'border-[#635bff] bg-indigo-50 dark:bg-indigo-950/20' },
                ].map((method) => (
                  <button
                    key={method.key}
                    onClick={() => handleProviderChange(method.key as 'orange' | 'mtn' | 'card')}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-xs font-medium ${
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
                <AnimatePresence mode="wait">
                  <motion.div
                    key={paymentProvider}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-4"
                  >
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total à payer</span>
                      <span className="font-bold text-xl">{selectedPack?.price} FCFA</span>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Numéro {paymentProvider === 'orange' ? 'Orange' : 'MTN'}</Label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          placeholder="6XXXXXXXX ou 237 6XXXXXXXX"
                          className="pl-10 h-12"
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

                    {paymentReference ? (
                      <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-4 text-center space-y-2">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#1e40af]" />
                        <p className="font-medium text-sm">Paiement envoyé !</p>
                        <p className="text-xs text-muted-foreground">
                          Confirmez la transaction sur votre téléphone. Mise à jour automatique.
                        </p>
                        {error && <p className="text-xs text-red-500">{error}</p>}
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">
                          Retour
                        </Button>
                        <Button
                          onClick={handleMobileMoneyPayment}
                          disabled={isLoading || !phoneNumber}
                          className={`flex-[2] h-12 ${
                            paymentProvider === 'orange'
                              ? 'bg-[#ff7900] hover:bg-[#e06a00] text-white'
                              : 'bg-[#ffcc00] hover:bg-[#e6b800] text-black'
                          }`}
                        >
                          {isLoading ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Traitement...</>
                          ) : (
                            <><Smartphone className="w-4 h-4 mr-2" />Payer {selectedPack?.price} FCFA</>
                          )}
                        </Button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
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
                    <motion.div key="stripe-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      {error && (
                        <div className="flex items-center gap-2 text-red-500 text-sm mb-3">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}
                      <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret }}>
                        <StripeCardForm
                          clientSecret={stripeClientSecret}
                          reference={paymentReference ?? ''}
                          selectedPack={selectedPack}
                          onSuccess={handleStripeSuccess}
                          onError={(msg) => setError(msg)}
                        />
                      </Elements>
                      <Button variant="outline" onClick={() => setStep(1)} className="w-full mt-3 h-10">
                        ← Retour au choix du pack
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div key="stripe-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
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
      </DialogContent>
    </Dialog>
  );
}
