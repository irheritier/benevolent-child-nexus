import { motion } from 'framer-motion';
import { Header } from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import StatisticsSection from '@/components/landing/StatisticsSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { TrustSection } from '@/components/landing/TrustSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';
import { Helmet } from 'react-helmet-async';
import { texts } from '@/data/translations';

const Index = () => {
  const currentLanguage = 'fr'; // Default to French
  const t = texts[currentLanguage];

  // Animation variants for page sections
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  };

  const heroVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const
      }
    }
  };

  const statsVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const
      }
    }
  };

  const featuresVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const
      }
    }
  };

  const trustVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const
      }
    }
  };

  const ctaVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const
      }
    }
  };

  const footerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>FCS - Find Children to Save | Plateforme de protection de l'enfance en RDC</title>
        <meta 
          name="description" 
          content="Plateforme digitale pour la protection et le suivi des enfants orphelins et vulnérables en République Démocratique du Congo. Transparence, efficacité et impact mesurable." 
        />
        <meta name="keywords" content="orphelinat, RDC, enfants, protection, suivi, transparence" />
        <meta name="author" content="FCS - Find Children to Save" />
        <meta property="og:title" content="FCS - Find Children to Save" />
        <meta property="og:description" content="Plateforme digitale pour la protection des enfants orphelins en RDC" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://findchildrentosave.com" />
      </Helmet>

      <motion.div
        className="min-h-screen bg-white dark:bg-gray-900"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header avec animation d'entrée depuis le haut */}
        <motion.div variants={headerVariants}>
          <Header 
            language={currentLanguage}
            setLanguage={() => {}}
            adminLoginText={t.cta.adminLogin}
          />
        </motion.div>

        {/* Hero Section avec animation fade-in + slide-up */}
        <motion.div
          variants={heroVariants}
          whileInView="visible"
          initial="hidden"
          viewport={{ once: true, amount: 0.3 }}
        >
          <HeroSection 
            title={t.title}
            subtitle={t.subtitle}
            heroDescription={t.heroDescription}
            registerText={t.cta.register}
            exploreMapText={t.cta.exploreMap}
          />
        </motion.div>

        {/* Statistics Section avec animation retardée */}
        <motion.div
          variants={statsVariants}
          whileInView="visible"
          initial="hidden"
          viewport={{ once: true, amount: 0.2 }}
        >
          <StatisticsSection />
        </motion.div>

        {/* Features Section avec animation slide-up */}
        <motion.div
          variants={featuresVariants}
          whileInView="visible"
          initial="hidden"
          viewport={{ once: true, amount: 0.3 }}
        >
          <FeaturesSection features={t.features} />
        </motion.div>

        {/* Trust Section avec animation scale + fade */}
        <motion.div
          variants={trustVariants}
          whileInView="visible"
          initial="hidden"
          viewport={{ once: true, amount: 0.4 }}
        >
          <TrustSection trust={t.trust} />
        </motion.div>

        {/* CTA Section avec animation dynamique */}
        <motion.div
          variants={ctaVariants}
          whileInView="visible"
          initial="hidden"
          viewport={{ once: true, amount: 0.3 }}
        >
          <CTASection 
            registerText={t.cta.register}
            exploreMapText={t.cta.exploreMap}
          />
        </motion.div>

        {/* Footer avec animation finale */}
        <motion.div
          variants={footerVariants}
          whileInView="visible"
          initial="hidden"
          viewport={{ once: true, amount: 0.1 }}
        >
          <Footer footer={t.footer} />
        </motion.div>
      </motion.div>
    </>
  );
};

export default Index;
