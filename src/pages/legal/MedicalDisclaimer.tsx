import React from 'react';
import LegalPageLayout from '../../components/LegalPageLayout';
import { usePageMeta } from '../../utils/usePageMeta';

const MedicalDisclaimer: React.FC = () => {
  usePageMeta('medicalDisclaimer');

  return (
    <LegalPageLayout
      title="Медицинский отказ от ответственности"
      subtitle="Пожалуйста, внимательно ознакомьтесь с условиями безопасной практики."
    >
      <section>
        <h2 className="text-xl font-semibold mb-2">1. Общие положения</h2>
        <p>
          Практика йоги является физической активностью. Пользователь самостоятельно оценивает состояние
          здоровья и принимает решение о допуске к занятиям.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">2. Рекомендации перед стартом</h2>
        <ul className="space-y-2 list-disc pl-5">
          <li>При наличии хронических заболеваний необходимо проконсультироваться с врачом.</li>
          <li>Во время обострений, травм и острых болевых состояний практика допускается только по согласованию с врачом.</li>
          <li>При ухудшении самочувствия занятие следует немедленно прекратить.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">3. Ограничение ответственности</h2>
        <p>
          TJ Yoga предоставляет информационно-консультационный формат и не оказывает медицинских услуг.
          Преподавательские рекомендации не заменяют очную медицинскую диагностику и лечение.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">4. Подтверждение пользователя</h2>
        <p>
          Продолжая оформление покупки и ставя галочку согласия в checkout, пользователь подтверждает,
          что ознакомлен с данным документом, понимает риски и принимает личную ответственность за
          соблюдение безопасной практики.
        </p>
      </section>
    </LegalPageLayout>
  );
};

export default MedicalDisclaimer;
