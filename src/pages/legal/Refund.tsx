import React from 'react';
import LegalPageLayout from '../../components/LegalPageLayout';
import { OPERATOR_INFO } from '../../config/legalDocuments';
import { usePageMeta } from '../../utils/usePageMeta';

const Refund: React.FC = () => {
  usePageMeta('refund');

  return (
    <LegalPageLayout
      title="Условия возврата"
      subtitle="Правила отмены доступа и возврата средств по услугам TJ Yoga."
    >
      <section>
        <h2 className="text-xl font-semibold mb-2">1. Базовые условия</h2>
        <p>
          Возврат рассматривается по письменному обращению пользователя. Заявка должна содержать
          контактные данные, дату оплаты и описание причины возврата.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">2. Клубная подписка</h2>
        <ul className="space-y-2 list-disc pl-5">
          <li>До момента активации доступа: возврат возможен в полном объеме.</li>
          <li>После активации: возврат рассчитывается пропорционально неиспользованному периоду.</li>
          <li>При нарушении правил пользования доступ может быть ограничен без возврата.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">3. Ретриты и персональные занятия</h2>
        <ul className="space-y-2 list-disc pl-5">
          <li>Ретриты: условия возврата зависят от даты отмены и фактических затрат на бронирования.</li>
          <li>Персональные занятия: перенос или возврат обсуждается до начала согласованного слота.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">4. Срок рассмотрения</h2>
        <p>
          Решение по заявке принимается в течение 10 рабочих дней с даты получения обращения. При
          подтверждении возврата перечисление средств выполняется тем же способом, которым была проведена
          оплата, если иное не согласовано дополнительно.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">5. Контакты для обращений</h2>
        <p>Юридические обращения: {OPERATOR_INFO.legalEmail}</p>
        <p>Оперативная поддержка: {OPERATOR_INFO.supportEmail}</p>
      </section>
    </LegalPageLayout>
  );
};

export default Refund;
