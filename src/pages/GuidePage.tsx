import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getGuideBySlug } from '@/data/guides';
import GuideTemplate from '@/components/guides/GuideTemplate';

const GuidePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return <Navigate to="/guide" replace />;
  }

  const guide = getGuideBySlug(slug);

  if (!guide) {
    return <Navigate to="/guide" replace />;
  }

  return <GuideTemplate guide={guide} />;
};

export default GuidePage;
