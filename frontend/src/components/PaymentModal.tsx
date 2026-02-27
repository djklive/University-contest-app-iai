import { useState, useEffect, useRef } from 'react';
import { Smartphone, CreditCard, Check, AlertCircle, Loader2 } from 'lucide-react';
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
import { payVote, getPaymentStatus } from '../lib/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string | null;
  votePacks: VotePack[];
  onSuccess: () => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  candidateId,
  votePacks,
  onSuccess,
}: PaymentModalProps) {
  const [step, setStep] = useState(1);
  const [selectedPackId, setSelectedPackId] = useState('single');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentProvider, setPaymentProvider] = useState<'orange' | 'mtn'>('orange');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedPackId('single');
      setPhoneNumber('');
      setError(null);
      setShowConfetti(false);
      setIsLoading(false);
      setPaymentReference(null);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  }, [isOpen]);

  const selectedPack = votePacks.find((p) => p.id === selectedPackId);

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      handlePayment();
    }
  };

  const handlePayment = async () => {
    if (!phoneNumber.match(/^(6[5-9]|6[2])\d{7}$/)) {
      setError('Numéro de téléphone invalide (Format: 6XXXXXXXX)');
      return;
    }
    if (!candidateId || !selectedPack) return;

    setError(null);
    setIsLoading(true);

    const channel = paymentProvider === 'mtn' ? 'cm.mtn' : 'cm.orange';
    const phone = phoneNumber.startsWith('237') ? phoneNumber : `237${phoneNumber.replace(/\D/g, '')}`;

    const data = await payVote({
      candidateId,
      packId: selectedPackId,
      amount: selectedPack.price,
      channel,
      phone,
    });

    if (!data.success) {
      setError(data.message || 'Erreur lors du paiement.');
      setIsLoading(false);
      return;
    }

    if (!data.reference) {
      setError('Référence de paiement manquante.');
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
      if (status.status === 'complete' && status.candidateId && status.votes != null) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setStep(3);
        setShowConfetti(true);
        onSuccess();
      }
      if (status.status === 'failed') {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setError('Paiement refusé ou échoué. Vous pouvez réessayer.');
        setIsLoading(false);
        setPaymentReference(null);
      }
      if (attempts >= maxAttempts) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setError('Délai dépassé. Si vous avez confirmé sur votre téléphone, rechargez la page pour voir le résultat.');
        setIsLoading(false);
        setPaymentReference(null);
      }
    }, 2500);

    setIsLoading(false);
  };

  const steps = [
    { id: 1, label: 'Choix' },
    { id: 2, label: 'Paiement' },
    { id: 3, label: 'Succès' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-lg max-h-[90vh] overflow-y-auto dark:bg-gray-900/95  border-none shadow-2xl p-6 gap-6">
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
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-4">
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
                      <div className="text-right">
                        <p className="font-bold text-[#1e40af] text-lg">{pack.price} FCFA</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button onClick={handleNextStep} className="w-full h-12 text-lg mt-8 bg-[#1e40af] hover:bg-[#1e3a8a]">
                Continuer
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex justify-between items-center">
                <span>Total à payer:</span>
                <span className="font-bold text-xl">{selectedPack?.price} FCFA</span>
              </div>

              <div className="flex flex-col gap-4">
                <Label>Moyen de paiement</Label>
                <RadioGroup
                  value={paymentProvider}
                  onValueChange={(v) => setPaymentProvider(v as 'orange' | 'mtn')}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="relative">
                    <RadioGroupItem value="orange" id="orange" className="peer sr-only" />
                    <Label
                      htmlFor="orange"
                      className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 cursor-pointer transition-all ${
                        paymentProvider === 'orange'
                          ? 'border-[#ff7900] bg-[#ff7900]/15 ring-2 ring-[#ff7900]/40'
                          : 'border-muted bg-muted/30 hover:border-[#ff7900]/50'
                      }`}
                    >
                      <span className="font-bold">Orange Money</span>
                      {paymentProvider === 'orange' && (
                        <span className="text-xs text-[#ff7900] mt-1">Sélectionné</span>
                      )}
                    </Label>
                  </div>
                  <div className="relative">
                    <RadioGroupItem value="mtn" id="mtn" className="peer sr-only" />
                    <Label
                      htmlFor="mtn"
                      className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 cursor-pointer transition-all ${
                        paymentProvider === 'mtn'
                          ? 'border-[#ffcc00] bg-[#ffcc00]/15 ring-2 ring-[#ffcc00]/40'
                          : 'border-muted bg-muted/30 hover:border-[#ffcc00]/50'
                      }`}
                    >
                      <span className="font-bold">MTN MoMo</span>
                      {paymentProvider === 'mtn' && (
                        <span className="text-xs text-[#b38600] dark:text-[#ffcc00] mt-1">Sélectionné</span>
                      )}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="6XXXXXXXX"
                    className="pl-10 h-12"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 9));
                      setError(null);
                    }}
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {paymentReference ? (
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 text-center space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#1e40af]" />
                  <p className="font-medium">Paiement envoyé!</p>
                  <p className="text-sm text-muted-foreground">
                    En production : confirmez sur votre téléphone (MTN / Orange). Le statut se met à jour automatiquement.
                  </p>
                  <p className="text-xs text-muted-foreground/90">
                    En mode test (sandbox) : aucun SMS réel. Avec le numéro 670000000 (MTN), le statut peut passer à « Succès » sous 30 secondes.
                  </p>
                  {error && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>
                  )}
                </div>
              ) : (
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">
                    Retour
                  </Button>
                  <Button 
                    onClick={handlePayment} 
                    disabled={isLoading || !phoneNumber} 
                    className="flex-[2] h-12 bg-[#1e40af] hover:bg-[#1e3a8a]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Payer {selectedPack?.price} FCFA
                      </>
                    )}
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-6"
            >
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-2">Vote Enregistré!</h3>
                <p className="text-muted-foreground">
                  Merci pour votre soutien. Vos {selectedPack?.votes} votes ont été ajoutés.
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
