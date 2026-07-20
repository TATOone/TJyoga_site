import React from 'react';
import LegalPageLayout from '../../components/LegalPageLayout';
import { OPERATOR_INFO } from '../../config/legalDocuments';
import { usePageMeta } from '../../utils/usePageMeta';

const Policy: React.FC = () => {
  usePageMeta('policy');

  return (
    <LegalPageLayout
      title="Политика обработки персональных данных"
      subtitle="Условия обработки персональных данных пользователей сервиса TJ Yoga."
    >
      <section>
        <h2 className="text-xl font-semibold mb-2">1. Какие данные мы собираем</h2>
        <ul className="space-y-2 list-disc pl-5">
          <li>Имя и фамилия.</li>
          <li>Email и Telegram username для связи и выдачи доступа.</li>
          <li>Технические данные: IP, user-agent и данные сессии оформления заказа.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">2. Цели обработки</h2>
        <ul className="space-y-2 list-disc pl-5">
          <li>Оформление и исполнение заказа.</li>
          <li>Предоставление доступа к оплаченным услугам.</li>
          <li>Поддержка пользователей и юридически значимые уведомления.</li>
          <li>Аналитика качества сервиса и безопасность платежного контура.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">3. Правовые основания</h2>
        <p>
          Обработка осуществляется на основании согласия пользователя, исполнения договора-оферты и
          требований законодательства РФ.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">4. Срок хранения и передача</h2>
        <p>
          Данные хранятся не дольше, чем это необходимо для целей оказания услуг и выполнения
          юридических обязательств. Передача третьим лицам ограничивается платежными и техническими
          провайдерами в объеме, необходимом для оказания услуги.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">5. Права пользователя</h2>
        <p>
          Пользователь вправе запросить уточнение, изменение или удаление персональных данных, а также
          отозвать согласие на обработку, направив запрос на {OPERATOR_INFO.legalEmail}.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">6. Контакты оператора</h2>
        <p>Оператор: {OPERATOR_INFO.operatorName}</p>
        <p>Статус: {OPERATOR_INFO.operatorStatus}</p>
        <p>Email: {OPERATOR_INFO.legalEmail}</p>
      </section>
    </LegalPageLayout>
  );
};

export default Policy;
