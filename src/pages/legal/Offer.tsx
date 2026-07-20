import React from 'react';
import LegalPageLayout from '../../components/LegalPageLayout';
import { OPERATOR_INFO } from '../../config/legalDocuments';
import { usePageMeta } from '../../utils/usePageMeta';

const Offer: React.FC = () => {
  usePageMeta('offer');

  return (
    <LegalPageLayout
      title="Публичная оферта"
      subtitle="Договор-оферта на оказание информационно-консультационных услуг TJ Yoga."
    >
      <section>
        <h2 className="text-xl font-semibold mb-2">1. Общие положения</h2>
        <p>
          Настоящий документ является официальным предложением {OPERATOR_INFO.operatorName} (
          {OPERATOR_INFO.operatorStatus}) о заключении договора на оказание услуг TJ Yoga.
          Акцептом оферты считается оформление заказа через checkout и совершение оплаты.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">2. Предмет договора</h2>
        <p>
          Исполнитель предоставляет доступ к цифровым продуктам TJ Yoga: клубной подписке, программам
          ретритов и персональным консультациям. Состав услуги определяется выбранным тарифом на
          странице покупки.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">3. Порядок оплаты и предоставления доступа</h2>
        <p>
          Услуги оказываются на условиях 100% предоплаты. Доступ предоставляется автоматически после
          подтверждения оплаты либо вручную в рамках SLA, указанного на странице «Как купить».
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">4. Права и обязанности сторон</h2>
        <ul className="space-y-2 list-disc pl-5">
          <li>Исполнитель обязуется предоставить доступ в оплаченный период и обеспечить поддержку.</li>
          <li>Пользователь обязуется предоставлять корректные контактные данные и соблюдать правила доступа.</li>
          <li>Передача доступа третьим лицам без согласия исполнителя запрещена.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">5. Ответственность</h2>
        <p>
          Стороны несут ответственность в соответствии с законодательством РФ. Исполнитель не несет
          ответственности за невозможность оказания услуг по причинам, зависящим от пользователя
          (некорректные данные, блокировки мессенджера, отсутствие интернет-доступа).
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">6. Подписка и grace-period</h2>
        <p>
          Доступ к Йога-Клубу предоставляется на срок выбранного тарифа. Продление выполняется
          вручную повторной оплатой. После окончания оплаченного периода действует grace-period 72
          часа, в течение которого доступ сохраняется.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">7. Реквизиты и контакт</h2>
        <p>Оператор: {OPERATOR_INFO.operatorName}</p>
        <p>Статус: {OPERATOR_INFO.operatorStatus}</p>
        <p>ИНН: {OPERATOR_INFO.inn}</p>
        <p>{OPERATOR_INFO.taxInfo}</p>
        <p>{OPERATOR_INFO.bankDetailsNote}</p>
        <p>Юридический контакт: {OPERATOR_INFO.legalEmail}</p>
        <p>Поддержка: {OPERATOR_INFO.supportEmail}, Telegram {OPERATOR_INFO.legalTelegram}</p>
      </section>
    </LegalPageLayout>
  );
};

export default Offer;
