import { Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface Step {
  id: number;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1">
          {/* Step Indicator */}
          <div
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full font-semibold transition-all',
              currentStep > step.id
                ? 'bg-green-500 text-white'
                : currentStep === step.id
                ? 'bg-[#1e40af] text-white ring-2 ring-blue-300'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            )}
          >
            {currentStep > step.id ? (
              <Check className="w-4 h-4" />
            ) : (
              step.id
            )}
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                'flex-1 h-1 mx-2 transition-all',
                currentStep > step.id
                  ? 'bg-green-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
