import React from 'react';
import { Link } from 'react-router-dom';
import {
  TEACHERS,
  TEACHERS_ABOUT_LABEL,
  TEACHERS_ABOUT_PATH,
  TEACHERS_HEADLINE,
  TEACHERS_PHOTO,
  TEACHERS_TEASER,
} from '../config/teachers';
import { analyticsEvents } from '../utils/analytics';

interface TeachersTeaserProps {
  analyticsLocation: string;
}

const TeachersTeaser: React.FC<TeachersTeaserProps> = ({ analyticsLocation }) => {
  return (
    <section
      aria-labelledby="teachers-teaser-heading"
      className="min-w-0 overflow-hidden rounded-card border border-light-sandy bg-cream p-4 shadow-soft sm:p-5"
    >
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <img
          src={TEACHERS_PHOTO.src}
          alt={TEACHERS_PHOTO.alt}
          className="h-16 w-16 shrink-0 rounded-full object-cover sm:h-20 sm:w-20"
          width="80"
          height="80"
          loading="lazy"
          decoding="async"
        />
        <div className="min-w-0">
          <h2
            id="teachers-teaser-heading"
            className="font-display text-lg font-semibold text-dark-brown sm:text-xl"
          >
            {TEACHERS_HEADLINE}
          </h2>
          <p className="mt-1 text-sm leading-snug text-gray-brown">{TEACHERS_TEASER}</p>
          <p className="sr-only">
            {TEACHERS.map((teacher) => `${teacher.displayName} — ${teacher.role}, ${teacher.facts}`).join(
              '. ',
            )}
          </p>
          <Link
            to={TEACHERS_ABOUT_PATH}
            className="mt-2 inline-flex min-h-touch items-center text-sm font-medium text-terracotta transition-colors hover:text-golden-sandy"
            onClick={() => analyticsEvents.ctaClick(TEACHERS_ABOUT_LABEL, analyticsLocation)}
          >
            {TEACHERS_ABOUT_LABEL}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TeachersTeaser;
