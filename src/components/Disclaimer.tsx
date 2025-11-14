import React, { useState } from 'react';

interface DisclaimerProps {
  onConfirm?: (confirmed: boolean) => void;
  required?: boolean;
  className?: string;
}

const Disclaimer: React.FC<DisclaimerProps> = ({ 
  onConfirm, 
  required = true,
  className = '' 
}) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const confirmed = e.target.checked;
    setIsConfirmed(confirmed);
    if (onConfirm) {
      onConfirm(confirmed);
    }
  };

  return (
    <div className={`bg-light-olive border border-light-sandy rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="disclaimer-checkbox"
          checked={isConfirmed}
          onChange={handleChange}
          required={required}
          className="mt-1 w-5 h-5 text-terracotta border-gray-300 rounded focus:ring-terracotta focus:ring-2 cursor-pointer"
          aria-required={required}
          aria-describedby="disclaimer-text"
        />
        <div className="flex-1">
          <label 
            htmlFor="disclaimer-checkbox" 
            className="text-sm text-dark-brown cursor-pointer"
          >
            <span className="font-semibold">
              Я подтверждаю, что ознакомлен(а) с условиями участия и отказом от ответственности
            </span>
            {!isExpanded && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsExpanded(true);
                }}
                className="ml-2 text-terracotta hover:text-golden-sandy underline text-xs"
                aria-expanded={isExpanded}
              >
                (читать полностью)
              </button>
            )}
          </label>
          
          {isExpanded && (
            <div 
              id="disclaimer-text"
              className="mt-3 text-sm text-gray-brown space-y-2"
            >
              <p>
                <strong>Отказ от ответственности:</strong>
              </p>
              <p>
                Занимаясь йогой под руководством TJ Yoga, я понимаю и принимаю, что:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Йога — это физическая активность, которая может привести к травмам</li>
                <li>Я несу полную ответственность за своё здоровье и безопасность во время практики</li>
                <li>Я обязуюсь следовать инструкциям преподавателя и не выполнять упражнения, которые могут навредить моему здоровью</li>
                <li>Я уведомлю преподавателя о любых медицинских противопоказаниях, травмах или ограничениях</li>
                <li>TJ Yoga, Женя Старовойтова и Тим не несут ответственности за любые травмы, полученные во время практики йоги</li>
                <li>Я занимаюсь на свой страх и риск</li>
              </ul>
              <p className="text-xs mt-3 italic">
                Если у тебя есть сомнения относительно состояния здоровья, обязательно проконсультируйся с врачом перед началом практики.
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsExpanded(false);
                }}
                className="mt-2 text-terracotta hover:text-golden-sandy underline text-xs"
              >
                (свернуть)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;

