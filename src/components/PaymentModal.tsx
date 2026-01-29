import { useState } from 'react';
import { Check, Smartphone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Card } from './ui/card';
import { votePacks, candidates } from '../lib/mockData';
import { toast } from 'sonner';

interface PaymentModalProps {
  isOpen: boolean;
  candidateId: string | null;
  onClose: () => void;
  onSuccess: (candidateId: string, votesCount: number) => void;
}

export function PaymentModal({ isOpen, candidateId, onClose, onSuccess }: PaymentModalProps) {
  const [selectedPack, setSelectedPack] = useState(votePacks[0].id);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState<'orange' | 'mtn'>('orange');
  const [isProcessing, setIsProcessing] = useState(false);

  const candidate = candidateId ? candidates.find(c => c.id === candidateId) : null;
  const pack = votePacks.find(p => p.id === selectedPack);

  const handlePayment = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      toast.error('Veuillez entrer un numéro de téléphone valide');
      return;
    }

    if (!candidateId || !pack) return;

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      toast.success(`Paiement réussi! ${pack.votes} vote(s) ajouté(s) pour ${candidate?.name}`);
      onSuccess(candidateId, pack.votes);
      onClose();
      setPhoneNumber('');
      setSelectedPack(votePacks[0].id);
    }, 2000);
  };

  if (!candidate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Voter pour {candidate.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Vote Packs */}
          <div>
            <Label className="mb-3 block">Choisir un Pack</Label>
            <div className="grid grid-cols-3 gap-2">
              {votePacks.map((votePack) => (
                <Card
                  key={votePack.id}
                  className={`p-3 cursor-pointer transition-all relative ${
                    selectedPack === votePack.id
                      ? candidate.category === 'miss'
                        ? 'border-[#fbbf24] bg-amber-50 dark:bg-amber-950/20'
                        : 'border-[#1e40af] bg-blue-50 dark:bg-blue-950/20'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                  onClick={() => setSelectedPack(votePack.id)}
                >
                  {votePack.popular && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      Populaire
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      {votePack.votes} {votePack.votes > 1 ? 'votes' : 'vote'}
                    </p>
                    <p className="mt-1">{votePack.price} FCFA</p>
                    {votePack.votes > 1 && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {votePack.price / votePack.votes} F/vote
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Provider Selection */}
          <div>
            <Label className="mb-3 block">Opérateur Mobile</Label>
            <RadioGroup value={provider} onValueChange={(value) => setProvider(value as 'orange' | 'mtn')}>
              <div className="grid grid-cols-2 gap-3">
                <Card
                  className={`p-4 cursor-pointer ${
                    provider === 'orange' ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : ''
                  }`}
                  onClick={() => setProvider('orange')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="orange" id="orange" />
                    <Label htmlFor="orange" className="flex items-center gap-2 cursor-pointer">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white">
                        O
                      </div>
                      <span>Orange Money</span>
                    </Label>
                  </div>
                </Card>

                <Card
                  className={`p-4 cursor-pointer ${
                    provider === 'mtn' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' : ''
                  }`}
                  onClick={() => setProvider('mtn')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mtn" id="mtn" />
                    <Label htmlFor="mtn" className="flex items-center gap-2 cursor-pointer">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white">
                        M
                      </div>
                      <span>MTN MoMo</span>
                    </Label>
                  </div>
                </Card>
              </div>
            </RadioGroup>
          </div>

          {/* Phone Number */}
          <div>
            <Label htmlFor="phone" className="mb-2 block">Numéro de téléphone</Label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="6 XX XX XX XX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="pl-10"
                maxLength={9}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Format: 6XXXXXXXX (9 chiffres)
            </p>
          </div>

          {/* Summary */}
          <Card className="p-4 bg-muted/50">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Candidat(e)</span>
                <span>{candidate.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nombre de votes</span>
                <span>{pack?.votes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Opérateur</span>
                <span className="capitalize">{provider === 'orange' ? 'Orange Money' : 'MTN MoMo'}</span>
              </div>
              <div className="pt-2 border-t flex justify-between items-center">
                <span>Total</span>
                <span className="text-lg">{pack?.price} FCFA</span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isProcessing}>
              Annuler
            </Button>
            <Button
              onClick={handlePayment}
              className={`flex-1 ${
                candidate.category === 'miss'
                  ? 'bg-[#fbbf24] hover:bg-[#f59e0b] text-black'
                  : 'bg-[#1e40af] hover:bg-[#1e3a8a]'
              }`}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Traitement...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Confirmer
                </>
              )}
            </Button>
          </div>

          {/* Security Note */}
          <p className="text-xs text-center text-muted-foreground">
            🔒 Paiement sécurisé via Mobile Money
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
