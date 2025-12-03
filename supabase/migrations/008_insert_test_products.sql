-- Migration : Insertion de 20 produits de test (5 par catégorie) pour tester les performances
-- Images open source depuis Unsplash

-- Catégorie: Classiques (5 produits)
INSERT INTO produits (nom, description, prix, stock, image_url, categorie, vedette, date_ajout) VALUES
(
  'Mocassin Artisanal Marrakech',
  'Mocassin classique en cuir de veau premium, confectionné à la main par nos maîtres artisans. Confort exceptionnel et élégance intemporelle. Semelle cuir cousue Goodyear pour une durabilité maximale.',
  2890.00,
  15,
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
  'Classiques',
  true,
  NOW()
),
(
  'Derby Oxford Casablanca',
  'Derby Oxford en cuir italien noir, finition lisse. Style formel parfait pour les occasions professionnelles et les événements élégants. Doublure cuir et semelle en cuir cousue main.',
  3290.00,
  12,
  'https://images.unsplash.com/photo-1605812860427-40144383f3a6?w=800&q=80',
  'Classiques',
  false,
  NOW()
),
(
  'Brogue Chaussure Fès',
  'Brogue en cuir marron avec perforations décoratives caractéristiques. Style britannique revisité avec une touche marocaine. Patine naturelle et finition soignée.',
  3590.00,
  10,
  'https://images.unsplash.com/photo-1608256246200-53c82b0bb587?w=800&q=80',
  'Classiques',
  true,
  NOW()
),
(
  'Loafer Sans Laçage Tanger',
  'Loafer élégant en cuir de veau cognac, sans laçage pour un style décontracté mais raffiné. Parfait pour le quotidien et les rendez-vous informels. Confort optimal.',
  2790.00,
  18,
  'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80',
  'Classiques',
  false,
  NOW()
),
(
  'Chaussure De Ville Rabat',
  'Chaussure de ville classique en cuir noir, finition brillante. Ligne épurée et élégante, idéale pour les occasions formelles. Qualité irréprochable.',
  3090.00,
  14,
  'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80',
  'Classiques',
  false,
  NOW()
);

-- Catégorie: Cuirs Exotiques (5 produits)
INSERT INTO produits (nom, description, prix, stock, image_url, categorie, vedette, date_ajout) VALUES
(
  'Mocassin Cuir Crocodile Premium',
  'Mocassin exceptionnel en cuir de crocodile authentique, finition mate. Chaque paire est unique grâce aux écailles naturelles. Prestige et rareté à l''état pur. Édition très limitée.',
  12900.00,
  3,
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
  'Cuirs Exotiques',
  true,
  NOW()
),
(
  'Botte Cuir Serpent Exotique',
  'Botte élégante en cuir de serpent exotique, motifs uniques et texture distinctive. Finition soignée et artisanale. Pour les connaisseurs en quête d''exclusivité.',
  8900.00,
  5,
  'https://images.unsplash.com/photo-1608256246200-53c82b0bb587?w=800&q=80',
  'Cuirs Exotiques',
  false,
  NOW()
),
(
  'Derby Cuir Autruche Luxe',
  'Derby en cuir d''autruche authentique, texture granuleuse caractéristique. Confort exceptionnel et résistance naturelle. Symbole de luxe et d''élégance raffinée.',
  10900.00,
  4,
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
  'Cuirs Exotiques',
  true,
  NOW()
),
(
  'Loafer Cuir Lézard Premium',
  'Loafer sans laçage en cuir de lézard, finition brillante. Texture fine et élégante. Parfait pour les occasions spéciales. Chaque paire est une œuvre unique.',
  12900.00,
  3,
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
  'Cuirs Exotiques',
  false,
  NOW()
),
(
  'Chaussure Cuir Raie Premium',
  'Chaussure de luxe en cuir de raie, résistance et élégance incomparables. Texture unique et finition artisanale soignée. Pour les amateurs de cuirs rares.',
  14900.00,
  2,
  'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80',
  'Cuirs Exotiques',
  false,
  NOW()
);

-- Catégorie: Éditions Limitées (5 produits)
INSERT INTO produits (nom, description, prix, stock, image_url, categorie, vedette, date_ajout) VALUES
(
  'Collection Limitée "Heritage" 2024',
  'Édition limitée à 50 exemplaires numérotés. Chaussure en cuir de veau vieilli, patine artisanale unique. Boîte de présentation exclusive et certificat d''authenticité. Hommage à notre savoir-faire ancestral.',
  5990.00,
  50,
  'https://images.unsplash.com/photo-1605812860427-40144383f3a6?w=800&q=80',
  'Éditions Limitées',
  true,
  NOW()
),
(
  'Série Exclusive "Artisan" No. 1',
  'Première chaussure de notre série exclusive "Artisan". Confectionnée par notre maître artisan principal. Cuir sélectionné, finition exceptionnelle. Seulement 30 paires disponibles.',
  6990.00,
  30,
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
  'Éditions Limitées',
  true,
  NOW()
),
(
  'Édition Anniversaire "50 Ans"',
  'Collection commémorative célébrant 50 ans d''excellence. Chaussure en cuir premium avec détails dorés. Boîte collector et accessoires exclusifs. Édition numérotée limitée à 100 paires.',
  7990.00,
  100,
  'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80',
  'Éditions Limitées',
  false,
  NOW()
),
(
  'Collection "Maître Artisan" Signature',
  'Chaussure signée par notre maître artisan en chef. Cuir de qualité exceptionnelle, confection entièrement manuelle. Certificat d''authenticité et numérotation unique. Seulement 25 exemplaires.',
  8990.00,
  25,
  'https://images.unsplash.com/photo-1608256246200-53c82b0bb587?w=800&q=80',
  'Éditions Limitées',
  false,
  NOW()
),
(
  'Série Limitée "Premium Heritage"',
  'Édition ultra-limitée en cuir de veau premium vieilli 10 ans. Patine naturelle unique, finition artisanale soignée. Boîte de présentation en bois et certificat. Seulement 20 paires numérotées.',
  9990.00,
  20,
  'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80',
  'Éditions Limitées',
  false,
  NOW()
);

-- Catégorie: Nouveautés (5 produits)
INSERT INTO produits (nom, description, prix, stock, image_url, categorie, vedette, date_ajout) VALUES
(
  'Mocassin Moderne "Future"',
  'Nouveau design fusionnant tradition et modernité. Mocassin en cuir écologique avec semelle innovante en caoutchouc recyclé. Confort maximal et style contemporain.',
  3490.00,
  20,
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
  'Nouveautés',
  true,
  NOW()
),
(
  'Chaussure Sport-Elegance "Hybrid"',
  'Nouvelle collection fusion sport et élégance. Chaussure en cuir premium avec semelle technique. Parfaite pour les déplacements modernes sans compromis sur le style.',
  3890.00,
  16,
  'https://images.unsplash.com/photo-1605812860427-40144383f3a6?w=800&q=80',
  'Nouveautés',
  true,
  NOW()
),
(
  'Derby Minimaliste "Essential"',
  'Design épuré et minimaliste, ligne moderne. Cuir italien finition mate, semelle fine. Pour l''homme moderne qui apprécie l''élégance discrète et le confort.',
  3190.00,
  18,
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
  'Nouveautés',
  false,
  NOW()
),
(
  'Loafer Confort "Comfort Plus"',
  'Nouvelle technologie de confort intégrée. Loafer en cuir souple avec intérieur rembourré. Semelle orthopédique pour un soutien optimal. Style décontracté et moderne.',
  3590.00,
  22,
  'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80',
  'Nouveautés',
  false,
  NOW()
),
(
  'Chaussure Éco-Luxe "Nature"',
  'Innovation écologique : cuir tanné végétalement, semelle en matériaux recyclés. Design moderne et engagement environnemental. L''avenir du luxe responsable.',
  4190.00,
  15,
  'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80',
  'Nouveautés',
  false,
  NOW()
);

