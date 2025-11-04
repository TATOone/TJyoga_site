import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const Testimonials: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const testimonials = [
    {
      text: 'Ещё как помогают ваши знания и практики!!! С вами больше полугода! Прошла боль в спине, и с каждой практикой ощущаю маленькие шажочки вперёд! Это как чудо, наблюдать за изменениями, которые происходят в теле, уме, благодаря вам!!!',
      name: 'Наталья',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80'
    },
    {
      text: 'Ребята, практика с вами стала для меня очень важной частью жизни! Вот без преувеличения. Каждую практику жду, это время — святое время моего развития. И хоть и кажется, что это занятие только для себя, но эффект от практик ощущают и мои близкие 🥰 я стала устойчивее и сильнее, и делюсь этим с ними.'+ 
'Вы так много дарите другим! И я в том числе ценю вашу человечность и самоиронию. А разве кого-то вдохновляют образы идеальных людей? Мне кажется, тут как в асанах — не важно, как выглядит снаружи, важно, как ощущается внутри.'+ 
'Пусть и у вас будет место для несовершенства. Вы уже супер и точно на верном пути, раз столько людей идёт вместе с вами ❤️',
      name: 'Юлия',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80'
    },
    {
      text: 'Я понимала , что в нашем онлайн клубе , вы передаёте знания от первоисточников.' + 
'Но я вообще не догадывалась, что обучение будет в тысячу раз понятнее именно потому , что я уже столько времени с вами . '+ 
'Вы так круто , без лишней воды , понятно , интересно и даже в формате какой-то игры иногда ( когда даёте задания на неделю ) даете нам таааааааааак много информации . Сейчас я это так чётко осознаю )' +
'Люблю вас очень, и так круто, что вы есть! Нам всем с вами очень повезло',
      name: 'Екатерина',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80'
    }
  ];

  return (
    <section id="testimonials" className="py-16 bg-cream">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center text-dark-brown mb-12"
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Что говорят наши студенты
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-light-text p-6 rounded-lg shadow-lg border border-light-sandy"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <p className="text-dark-brown mb-4">"{testimonial.text}"</p>
              <div className="flex items-center">
                <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" loading="lazy" />
                <p className="font-semibold text-olive-green">{testimonial.name}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;