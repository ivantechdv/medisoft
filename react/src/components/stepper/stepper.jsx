import React from 'react';
import classNames from 'classnames';

const Stepper = ({ currentStep, totalSteps, stepTexts, onStepClick }) => {
  const breadcrumbs = Array.from({ length: totalSteps }, (_, index) => index + 1);

  const handleStepClick = (step) => {
    if (onStepClick) {
      onStepClick(step);
    }
  };

  return (
    <nav className="bg-emerald-300">
      <div className="flex w-full">
        {breadcrumbs.map((step, index) => (
          <div className="flex items-center" key={index}>
            <a
              onClick={() => handleStepClick(step)}
              className={classNames(
                'mx-2',
                'py-2',
                'px-2',
                'text-dark',
                {
                  'cursor-pointer': onStepClick,
                  'text-gray-900': !onStepClick,
                  'border-b-2 border-gray-800': index === currentStep - 1,
                  'bg-emerald-300': index !== currentStep - 1,
                }
              )}
            >
              {stepTexts && stepTexts[index] ? stepTexts[index] : `Step ${step}`}
            </a>
          </div>
        ))}
      </div>
    </nav>
  );
};

export default Stepper;
