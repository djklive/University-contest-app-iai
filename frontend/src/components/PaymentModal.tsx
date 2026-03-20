import { useState, useEffect, useRef } from 'react';
import { Smartphone, Check, AlertCircle, Loader2, ChevronDown, Lock } from 'lucide-react';
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
import {
  payVote,
  payStripe,
  getPaymentStatus,
  getNotchPayCountries,
  getNotchPayChannels,
  type NotchPayCountry,
  type NotchPayChannel,
} from '../lib/api';

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

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

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

interface StripeCardFormProps {
  clientSecret: string;
  reference: string;
  selectedPack: VotePack | undefined;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

function StripeCardForm({ clientSecret, reference: _reference, selectedPack, onSuccess, onError }: StripeCardFormProps) {
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
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2 mb-2">
        <Lock className="w-3 h-3 text-green-600 flex-shrink-0" />
        <span>Paiement sécurisé par <span className="font-semibold text-[#635bff]">Stripe</span> — vos données ne sont jamais stockées</span>
      </div>

      {/* Nom du titulaire */}
      <div className="flex flex-col gap-2">
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
      <div className="flex flex-col gap-2">
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
        <div className="flex flex-col gap-2">
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
        <div className="flex flex-col gap-2">
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
        className="w-full h-13 mb-4 text-base font-semibold bg-gradient-to-r from-[#635bff] to-[#4f46e5] hover:from-[#4f46e5] hover:to-[#3730a3] text-white rounded-xl shadow-lg disabled:opacity-60"
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

const CURRENCY_LABELS: Record<string, string> = {
  XAF: 'FCFA',
  XOF: 'FCFA',
  KES: 'KSh',
  UGX: 'USh',
  GHS: 'GH₵',
  NGN: '₦',
};

export function PaymentModal({
  isOpen,
  onClose,
  candidateId,
  votePacks,
  onSuccess,
}: PaymentModalProps) {
  const [step, setStep] = useState(1);
  const [selectedPackId, setSelectedPackId] = useState('single');

  const [countries, setCountries] = useState<NotchPayCountry[]>([]);
  const [channels, setChannels] = useState<NotchPayChannel[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<NotchPayCountry | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<NotchPayChannel | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [mobileReference, setMobileReference] = useState<string | null>(null);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Charger les pays à l'ouverture (fallback si l'API ne renvoie rien)
  useEffect(() => {
    if (isOpen) {
      getNotchPayCountries().then((list) => {
        const fallback: NotchPayCountry[] = [
          { code: 'CM', name: 'Cameroun', currency: 'XAF', phone_code: '+237' },
          { code: 'CI', name: "Côte d'Ivoire", currency: 'XOF', phone_code: '+225' },
          { code: 'SN', name: 'Sénégal', currency: 'XOF', phone_code: '+221' },
          { code: 'GH', name: 'Ghana', currency: 'GHS', phone_code: '+233' },
          { code: 'NG', name: 'Nigeria', currency: 'NGN', phone_code: '+234' },
          { code: 'KE', name: 'Kenya', currency: 'KES', phone_code: '+254' },
          { code: 'UG', name: 'Ouganda', currency: 'UGX', phone_code: '+256' },
        ];
        const listOrFallback = list?.length ? list : fallback;
        setCountries(listOrFallback);
        const cm = listOrFallback.find((c) => c.code === 'CM') || listOrFallback[0];
        if (cm) setSelectedCountry(cm);
      });
    }
  }, [isOpen]);

  // Charger les canaux quand le pays change
  useEffect(() => {
    if (!selectedCountry?.code) {
      setChannels([]);
      setSelectedChannel(null);
      return;
    }
    setChannelsLoading(true);
    setSelectedChannel(null);
    getNotchPayChannels(selectedCountry.code)
      .then(setChannels)
      .finally(() => setChannelsLoading(false));
  }, [selectedCountry?.code]);

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
      setShowCountryDropdown(false);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  }, [isOpen]);

  const selectedPack = votePacks.find((p) => p.id === selectedPackId);
  const currencyLabel = selectedCountry?.currency ? CURRENCY_LABELS[selectedCountry.currency] || selectedCountry.currency : 'FCFA';
  // Afficher le champ téléphone pour Mobile Money / USSD, ou si le canal ne dit pas explicitement le contraire (ex. API sans type)
  const channelType = (selectedChannel?.type || '').toLowerCase();
  const isMobileOrUssd = channelType === 'mobile' || channelType === 'ussd';
  const isCardOrBank = channelType === 'card' || channelType === 'bank';
  const needsPhone = Boolean(selectedChannel && !isCardOrBank && (isMobileOrUssd || selectedChannel.requires_phone !== false));

  // Icône de secours pour un canal selon son type
  function channelIcon(ch: NotchPayChannel): string {
    const t = (ch.type || '').toLowerCase();
    if (t === 'stripe') return '💳';
    if (t === 'card' || ch.id?.toLowerCase().includes('card')) return '💳';
    if (t === 'mobile' || t === 'ussd') return '📱';
    if (t === 'bank') return '🏦';
    return '💰';
  }

  const handlePay = async () => {
    if (!candidateId || !selectedPack || !selectedChannel) return;

    if (selectedChannel.id === 'stripe_card') {
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
      setMobileReference(data.reference ?? null);
      setIsLoading(false);
      return;
    }

    const phone = phoneNumber.replace(/\D/g, '');
    const phoneCode = selectedCountry?.phone_code?.replace('+', '') || '237';
    const fullPhone = phone.length <= 10 ? `${phoneCode}${phone}` : phone;

    if (needsPhone && fullPhone.length < 10) {
      setError('Veuillez saisir un numéro de téléphone valide.');
      return;
    }

    setError(null);
    setIsLoading(true);

    const data = await payVote({
      candidateId,
      packId: selectedPackId,
      amount: selectedPack.price,
      channel: selectedChannel.id,
      phone: fullPhone,
      country: selectedCountry?.code || 'CM',
    });

    if (!data.success || !data.reference) {
      setError(data.message || 'Erreur lors du paiement.');
      setIsLoading(false);
      return;
    }

    // Paiement carte : redirection vers la page sécurisée NotchPay (Collect)
    if (data.authorization_url) {
      window.location.href = data.authorization_url;
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
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
        setStep(3);
        setShowConfetti(true);
        onSuccess();
      }
      if (status.status === 'failed') {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
        setError('Paiement refusé. Vous pouvez réessayer.');
        setIsLoading(false);
        setMobileReference(null);
      }
      if (attempts >= maxAttempts) {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
        setError('Délai dépassé. Si vous avez confirmé sur votre téléphone, rechargez la page.');
        setIsLoading(false);
        setMobileReference(null);
      }
    }, 2500);

    setIsLoading(false);
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

        <div className="flex-1 overflow-y-auto px-6 pb-6 overflow-x-visible">
          <AnimatePresence mode="wait">
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
                <Button onClick={() => setStep(2)} className="w-full h-12 text-base mt-2 bg-[#1e40af] hover:bg-[#1e3a8a]">
                  Continuer
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <AnimatePresence mode="wait">
                {stripeClientSecret ? (
                  <motion.div key="stripe-layer" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-1">
                    <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret }}>
                      <StripeCardForm
                        clientSecret={stripeClientSecret}
                        reference={mobileReference ?? ''}
                        selectedPack={selectedPack}
                        onSuccess={() => {
                          setStep(3);
                          setShowConfetti(true);
                          onSuccess();
                        }}
                        onError={(msg) => setError(msg)}
                      />
                    </Elements>
                    <Button variant="outline" onClick={() => { setStripeClientSecret(null); setMobileReference(null); }} className="w-full mt-3 h-10">
                      ← Retour au choix des moyens de paiement
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-4"
                  >
                    {/* Total à payer */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total à payer</span>
                      <span className="font-bold text-xl">{selectedPack?.price} {currencyLabel}</span>
                    </div>

                {/* Votre position — Changer de pays (comme l’interface NotchPay) */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Votre position</p>
                  <div className="relative z-50">
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown((v) => !v)}
                      className="w-full flex items-center justify-between gap-2 p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        {selectedCountry?.flag ? (
                          <img src={selectedCountry.flag} alt="" className="w-6 h-4 object-cover rounded" />
                        ) : (
                          <span className="w-6 h-4 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-xs">🌍</span>
                        )}
                        <span className="font-medium">{selectedCountry?.name || 'Choisir un pays'}</span>
                      </span>
                      <span className="text-muted-foreground text-sm">Changer de pays</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showCountryDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl z-50">
                        {countries.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(c);
                              setShowCountryDropdown(false);
                            }}
                            className="w-full flex items-center gap-2 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
                          >
                            {c.flag ? (
                              <img src={c.flag} alt="" className="w-6 h-4 object-cover rounded" />
                            ) : (
                              <span className="w-6 h-4 bg-gray-200 rounded" />
                            )}
                            <span>{c.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Moyens de paiement (canaux) */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Moyen de paiement</p>
                  {channelsLoading ? (
                    <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Chargement...</span>
                    </div>
                  ) : channels.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-6 text-center text-muted-foreground text-sm">
                      <span className="text-3xl">🌍</span>
                      <p className="font-medium">Paiement non disponible pour ce pays.</p>
                      <p className="text-xs">Sélectionnez un pays supporté (ex. Cameroun, Côte d'Ivoire, Sénégal…)</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        ...channels,
                        { id: 'stripe_card', name: 'Carte Bancaire Internationale', type: 'stripe', requires_phone: false } as NotchPayChannel
                      ].map((ch) => (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => setSelectedChannel(ch)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-xs font-medium ${
                            selectedChannel?.id === ch.id
                              ? 'border-[#1e40af] bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {ch.logo ? (
                            <img
                              src={ch.logo}
                              alt=""
                              className="w-8 h-8 object-contain"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex'; }}
                            />
                          ) : null}
                          <span
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded text-xl"
                            style={{ display: ch.logo ? 'none' : 'flex' }}
                          >
                            {channelIcon(ch)}
                          </span>
                          <span className="text-center leading-tight">{ch.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Numéro de téléphone (si canal mobile_money / ussd) */}
                {selectedChannel && needsPhone && (
                  <div className="flex flex-col gap-4">
                    <Label htmlFor="phone">Numéro de téléphone</Label>
                    <div className="flex items-center h-11 rounded-lg border border-input bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0">
                      
                      {/* Icône + indicatif pays */}
                      <div className="flex items-center gap-1.5 px-3 border-r border-input bg-muted/40 h-full shrink-0">
                        <Smartphone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">
                          {selectedCountry?.phone_code || '+237'}
                        </span>
                      </div>

                      {/* Champ numéro */}
                      <Input
                        id="phone"
                        placeholder="6 71 23 45 67"
                        className="border-0 shadow-none focus-visible:ring-0 h-full pl-3 bg-transparent"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 12));
                          setError(null);
                        }}
                      />
                    </div>
                  </div>
                )}

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
                  </div>
                ) : (
                  <div className="flex gap-3 pt-1">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 h-11">
                      Retour
                    </Button>
                    <Button
                      type="button"
                      onClick={handlePay}
                      disabled={isLoading || !selectedChannel || (needsPhone && !phoneNumber.trim())}
                      
                    >
                      {isLoading ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Traitement...</>
                      ) : (
                        <>Payer {selectedPack?.price} {currencyLabel}</>
                      )}
                    </Button>
                  </div>
                )}
              </motion.div>
             )}
            </AnimatePresence>
            )}

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
        </div>
      </DialogContent>
    </Dialog>
  );
}
