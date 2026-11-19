import React from 'react';
import { motion } from 'framer-motion';
import {
  CAMPAIGN_ACCENT_IDS,
  CAMPAIGN_ACCENTS,
  getActiveAccent,
  type CampaignAccentId,
} from '../config/campaignAccent';
import { useSectionInView } from '../hooks/useSectionInView';
import { REVEAL_HIDDEN, REVEAL_VISIBLE, revealTransition } from '../lib/motion';

const audienceLead = (id: CampaignAccentId): string => {
  switch (id) {
    case 'beginners':
      return 'Если вы никогда не занимались йогой, приходите. У каждой асаны есть базовая форма, с неё и начнёте.';
    case 'depth':
      return 'Если вы уже практикуете, вас ждёт постоянный ритм недели: четыре живые практики и длинная воскресная практика на полтора часа.';
    case 'office-restore':
      return 'Если вы весь день за компьютером, практику легко вписать в неделю: вечером в среду и пятницу или утром в воскресенье и понедельник. А если не успели, можно позаниматься по записи.';
    default: {
      const unreachable: never = id;
      return unreachable;
    }
  }
};

const ForWhom: React.FC = () => {
  const { ref, isInView } = useSectionInView();
  const activeAccent = getActiveAccent();

  return (
    <section id="for-whom" className="py-16 bg-light-olive">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center text-dark-brown mb-10"
          ref={ref}
          initial={REVEAL_HIDDEN}
          animate={isInView ? REVEAL_VISIBLE : {}}
          transition={revealTransition()}
        >
          Клуб подойдёт и тем, кто начинает с нуля, и тем, кто уже практикует
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {CAMPAIGN_ACCENT_IDS.map((id, index) => {
            const accent = CAMPAIGN_ACCENTS[id];
            const isActive = id === activeAccent.id;

            return (
              <motion.div
                key={id}
                className={`text-center flex flex-col rounded-2xl p-5 border ${
                  isActive
                    ? 'border-terracotta/40 bg-cream shadow-sm'
                    : 'border-transparent bg-transparent'
                }`}
                initial={REVEAL_HIDDEN}
                animate={isInView ? REVEAL_VISIBLE : {}}
                transition={revealTransition(index * 0.12)}
              >
                <h3
                  className={`text-xl font-semibold mb-2 flex-shrink-0 ${
                    index % 2 === 0 ? 'text-terracotta-ink' : 'text-olive-ink'
                  }`}
                >
                  {accent.label}
                </h3>
                <p className="text-dark-brown flex-grow">{audienceLead(id)}</p>
              </motion.div>
            );
          })}
        </div>
        <motion.p
          className="text-center text-gray-brown max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={revealTransition(0.36)}
        >
          Перед первым занятием можно написать нам, если что-то беспокоит, и мы подскажем, с чего начать.
        </motion.p>
      </div>
    </section>
  );
};

export default ForWhom;
