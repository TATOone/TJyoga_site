import React from 'react';
import { motion } from 'framer-motion';
import {
  CAMPAIGN_ACCENT_IDS,
  CAMPAIGN_ACCENTS,
  getActiveAccent,
  type CampaignAccentId,
} from '../config/campaignAccent';
import { useSectionInView } from '../hooks/useSectionInView';

const audienceLead = (id: CampaignAccentId): string => {
  switch (id) {
    case 'beginners':
      return 'Можно приходить с нуля. Есть простой вариант асаны. Разрешите себе быть новичком.';
    case 'depth':
      return 'Уровни, первоисточники и ритм недели.';
    case 'office-restore':
      return 'День за компьютером. Практика вписывается в неделю: утро, вечер или запись.';
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
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Можно с нуля. Можно уже с практикой.
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
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <h3
                  className={`text-xl font-semibold mb-2 flex-shrink-0 ${
                    index % 2 === 0 ? 'text-terracotta' : 'text-olive-green'
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
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          Перед первым эфиром можно написать нам, что беспокоит в теле и уме.
        </motion.p>
      </div>
    </section>
  );
};

export default ForWhom;
