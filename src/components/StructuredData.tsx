export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Time4Swim",
    "applicationCategory": "HealthApplication",
    "operatingSystem": "Web",
    "description": "Software profesional para cronómetro de natación, gestión de tiempos, entrenamientos y competencias para clubes deportivos y familias",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "127"
    },
    "featureList": [
      "Cronómetro inteligente de natación",
      "Registro y análisis de tiempos",
      "Gestión de entrenamientos",
      "Control de competencias",
      "Gráficos de evolución",
      "Medallero y récords personales",
      "Gestión de equipos y nadadores",
      "Reportes automáticos"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Time4Swim",
    "url": "https://time4swim.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://time4swim.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const organizationInfoSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Time4Swim",
    "url": "https://time4swim.com",
    "logo": "https://time4swim.com/logo.png",
    "description": "Plataforma profesional para gestión de natación, cronometraje y análisis de rendimiento deportivo",
    "sameAs": [
      "https://facebook.com/time4swim",
      "https://twitter.com/time4swim",
      "https://instagram.com/time4swim",
      "https://linkedin.com/company/time4swim"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationInfoSchema) }}
      />
    </>
  );
}
