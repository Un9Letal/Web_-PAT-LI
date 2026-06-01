
export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  category: string;
  price: number;
};

// Imágenes verificadas de Unsplash — fotos reales de ropa que coinciden con cada producto.
// Se usa unoptimized=true en CatalogImage para cargar directo sin proxy de Next.js.
const U = (id: string) => `https://images.unsplash.com/${id}?w=600&h=800&q=80&fit=crop`;

export const PlaceHolderImages: ImagePlaceholder[] = [

  // ── CABALLEROS ──
  { id: 'polo-pima-blanco',       description: 'Polo Algodón Pima Premium Blanco',   imageUrl: U('photo-1521572163474-6864f9cf17ab'), imageHint: 'white crew neck polo shirt',    category: 'Caballeros', price: 45  },
  { id: 'polo-pima-negro',        description: 'Polo Pima Cuello V Negro',            imageUrl: U('photo-1583743814966-8936f5b7be1a'), imageHint: 'black polo shirt men',         category: 'Caballeros', price: 48  },
  { id: 'polo-pima-azul',         description: 'Polo Pima Classic Azul Marino',       imageUrl: U('photo-1618354691373-d851c5c3a990'), imageHint: 'navy blue polo shirt',         category: 'Caballeros', price: 45  },
  { id: 'polo-oversize-gris',     description: 'Polo Oversize Básico Gris',           imageUrl: U('photo-1562157873-818bc0726f68'),    imageHint: 'grey oversized t-shirt men',   category: 'Caballeros', price: 55  },
  { id: 'polo-rayas-nautico',     description: 'Polo Rayas Náutico Azul/Blanco',      imageUrl: U('photo-1598300042247-d088f8ab3a91'), imageHint: 'striped nautical shirt men',   category: 'Caballeros', price: 52  },
  { id: 'camisa-lino-caballero',  description: 'Camisa Lino Manga Larga Beige',       imageUrl: U('photo-1596755094514-f87e34085b2c'), imageHint: 'beige linen shirt men',        category: 'Caballeros', price: 85  },
  { id: 'camisa-oxford-cuadros',  description: 'Camisa Oxford Cuadros Slim',          imageUrl: U('photo-1607345366928-199ea26cfe3e'), imageHint: 'plaid oxford slim shirt men',  category: 'Caballeros', price: 78  },
  { id: 'jean-skinny-azul',       description: 'Jean Skinny Azul Ica',                imageUrl: U('photo-1542272604-787c3835535d'),    imageHint: 'skinny blue jeans men',        category: 'Caballeros', price: 95  },
  { id: 'jean-slim-oscuro',       description: 'Jean Slim Fit Azul Oscuro',           imageUrl: U('photo-1475178626620-a4d074967452'), imageHint: 'dark slim fit jeans men',      category: 'Caballeros', price: 105 },
  { id: 'pantalon-drill-camel',   description: 'Pantalón Drill Camel Clásico',        imageUrl: U('photo-1594938298603-c8148c4b4357'), imageHint: 'camel chino pants men',        category: 'Caballeros', price: 88  },
  { id: 'short-cargo-beige',      description: 'Short Cargo Multi-bolsillos Beige',   imageUrl: U('photo-1565084888279-aca607ecce0c'), imageHint: 'beige cargo shorts men',       category: 'Caballeros', price: 62  },
  { id: 'casaca-bomber-negra',    description: 'Casaca Bomber Premium Negra',         imageUrl: U('photo-1591047139829-d91aecb6caea'), imageHint: 'black bomber jacket men',      category: 'Caballeros', price: 195 },
  { id: 'jogger-gris-caballero',  description: 'Jogger Cómodo Algodón Gris',          imageUrl: U('photo-1608228088998-57828365d486'), imageHint: 'grey cotton jogger pants men', category: 'Caballeros', price: 72  },

  // ── DAMAS ──
  { id: 'vestido-lino-floral',     description: 'Vestido Lino Floral Verano',         imageUrl: U('photo-1572804013309-59a88b7e92f1'), imageHint: 'floral linen summer dress women',  category: 'Damas', price: 85  },
  { id: 'vestido-midi-elegante',   description: 'Vestido Midi Elegante Crema',        imageUrl: U('photo-1595777457583-95e059d581b8'), imageHint: 'elegant cream midi dress women',   category: 'Damas', price: 120 },
  { id: 'vestido-mini-estampado',  description: 'Vestido Mini Estampado Verano',      imageUrl: U('photo-1515372039744-b8f02a3ae446'), imageHint: 'mini summer printed dress women',  category: 'Damas', price: 75  },
  { id: 'vestido-maxi-boho',       description: 'Vestido Maxi Boho Turquesa',         imageUrl: U('photo-1496747611176-843222e1e57c'), imageHint: 'turquoise maxi boho dress women',  category: 'Damas', price: 135 },
  { id: 'blusa-seda-elegante',     description: 'Blusa Seda Elegante Marfil',         imageUrl: U('photo-1564257631407-4deb1f99d992'), imageHint: 'elegant ivory silk blouse women',  category: 'Damas', price: 65  },
  { id: 'blusa-floral-manga-corta',description: 'Blusa Floral Manga Corta Rosa',      imageUrl: U('photo-1602810318383-e386cc2a3ccf'), imageHint: 'floral short sleeve pink blouse',  category: 'Damas', price: 58  },
  { id: 'blusa-sin-mangas-premium',description: 'Blusa Sin Mangas Premium Coral',     imageUrl: U('photo-1551163943-3f7b40cde8b3'), imageHint: 'sleeveless coral premium top women',category: 'Damas', price: 55  },
  { id: 'falda-plisada-colores',   description: 'Falda Plisada Midi Colores',         imageUrl: U('photo-1583496661160-fb5886a0aaaa'), imageHint: 'colorful pleated midi skirt women',category: 'Damas', price: 68  },
  { id: 'conjunto-top-pantalon',   description: 'Conjunto Top + Pantalón Lino',       imageUrl: U('photo-1509631179647-0177331693ae'), imageHint: 'linen two piece set women',        category: 'Damas', price: 155 },
  { id: 'jumpsuit-casual-verde',   description: 'Jumpsuit Casual Lino Verde',         imageUrl: U('photo-1548624313-0396c75e4b1a'), imageHint: 'green casual linen jumpsuit women', category: 'Damas', price: 145 },
  { id: 'blazer-entallado-negro',  description: 'Blazer Entallado Elegante Negro',    imageUrl: U('photo-1594938374182-a57d4aab4e93'), imageHint: 'fitted elegant black blazer women', category: 'Damas', price: 185 },
  { id: 'pantalon-palazzo-blanco', description: 'Pantalón Palazzo Fluido Blanco',     imageUrl: U('photo-1506629082955-511b1aa562c8'), imageHint: 'white wide leg palazzo pants women',category: 'Damas', price: 92  },
  { id: 'casaca-cuero-dama',       description: 'Casaca Cuero Sintético Mujer',       imageUrl: U('photo-1551028719-00167b16eac5'), imageHint: 'black faux leather jacket women',   category: 'Damas', price: 180 },

  // ── NIÑOS ──
  { id: 'conjunto-algodon-kids',     description: 'Conjunto Algodón Kids Azul',       imageUrl: U('photo-1622290291468-a28f7a7dc6a8'), imageHint: 'kids blue cotton outfit set',      category: 'Niños', price: 55 },
  { id: 'polera-capucha-junior',     description: 'Polera con Capucha Junior',        imageUrl: U('photo-1519278409-1f56fdda7fe5'), imageHint: 'children hoodie sweatshirt',       category: 'Niños', price: 49 },
  { id: 'vestidito-floral-nina',     description: 'Vestidito Floral Niña Rosa',       imageUrl: U('photo-1518831959646-742c3a14ebf7'), imageHint: 'pink floral dress little girl',    category: 'Niños', price: 52 },
  { id: 'jean-jogger-nino',          description: 'Jean Jogger Niño Azul',            imageUrl: U('photo-1471286174890-9c112ffca5b4'), imageHint: 'blue jogger jeans boy child',      category: 'Niños', price: 58 },
  { id: 'set-verano-ninos',          description: 'Set Verano 2 Piezas Colores',      imageUrl: U('photo-1503944583220-79d8926ad5e2'), imageHint: 'colorful summer kids two piece set',category: 'Niños', price: 65 },
  { id: 'polito-cuello-ninos',       description: 'Polito Cuello Redondo Pima Kids',  imageUrl: U('photo-1555009393-f20bdb245c4d'), imageHint: 'round neck polo shirt kids cotton', category: 'Niños', price: 35 },
  { id: 'vestidito-lunares-rosa',    description: 'Vestidito Lunares Rosa Niña',      imageUrl: U('photo-1526887593587-4bfc35dd8ea3'), imageHint: 'polka dot pink dress girl child',  category: 'Niños', price: 48 },
  { id: 'conjunto-deportivo-junior', description: 'Conjunto Deportivo Junior',        imageUrl: U('photo-1604671801908-6f0c6a092c05'), imageHint: 'kids sports tracksuit set',        category: 'Niños', price: 72 },

  // ── BEBÉS ──
  { id: 'mameluco-algodon-bebe',  description: 'Mameluco Algodón Suave Bebé',         imageUrl: U('photo-1522771930-78848d9293e8'), imageHint: 'soft cotton baby romper onesie',   category: 'Bebés', price: 38 },
  { id: 'set-bodies-bebe',        description: 'Set Bodies x3 Unisex Bebé',           imageUrl: U('photo-1586015555751-63bb77f4322a'), imageHint: 'baby bodysuit set pastel unisex', category: 'Bebés', price: 55 },
  { id: 'pijama-bebe-estampada',  description: 'Pijama Bebé Estampado Ositos',        imageUrl: U('photo-1620138546344-7b2c38516edf'), imageHint: 'baby bear print pajamas sleeping', category: 'Bebés', price: 42 },
  { id: 'set-patitos-bebe',       description: 'Set Completo Patitos Amarillo',       imageUrl: U('photo-1519689680058-324335c77eba'), imageHint: 'yellow duck baby clothing gift set',category: 'Bebés', price: 68 },
  { id: 'gorrito-punto-bebe',     description: 'Gorrito de Punto Recién Nacido',      imageUrl: U('photo-1544568100-847a948585b9'), imageHint: 'newborn knit beanie hat baby',     category: 'Bebés', price: 22 },
  { id: 'ajuar-bebe-completo',    description: 'Ajuar Bebé Completo 5 Piezas',        imageUrl: U('photo-1515488042361-ee00e0ddd4e4'), imageHint: 'complete baby layette newborn set',category: 'Bebés', price: 95 },

  // ── DEPORTIVO ──
  { id: 'polo-running-hombre',       description: 'Polo Running Dri-Fit Hombre',      imageUrl: U('photo-1556906781-9a412961a28b'), imageHint: 'men dry fit running sport polo',   category: 'Deportivo', price: 58  },
  { id: 'leggings-deportivos-mujer', description: 'Leggings Deportivos Mujer Negro',  imageUrl: U('photo-1506629082955-511b1aa562c8'), imageHint: 'women black sports leggings gym',  category: 'Deportivo', price: 65  },
  { id: 'short-deportivo-hombre',    description: 'Short Deportivo Secado Rápido',    imageUrl: U('photo-1517931524985-62d56c58b753'), imageHint: 'men sports quick dry shorts gym',  category: 'Deportivo', price: 48  },
  { id: 'chaqueta-cortaviento',      description: 'Chaqueta Cortaviento Unisex',      imageUrl: U('photo-1542295669297-4d352b042bca'), imageHint: 'unisex windbreaker sport jacket',  category: 'Deportivo', price: 115 },
  { id: 'sudadera-hoodie-gris',      description: 'Sudadera Hoodie Cómoda Gris',      imageUrl: U('photo-1556821840-3a63f15732ce'), imageHint: 'grey comfortable hoodie sweatshirt',category: 'Deportivo', price: 88  },
  { id: 'camiseta-gym-mujer',        description: 'Camiseta Gym Tank Top Mujer',      imageUrl: U('photo-1518611012118-696072aa579a'), imageHint: 'women gym workout tank top sport', category: 'Deportivo', price: 42  },
  { id: 'conjunto-yoga-mujer',       description: 'Conjunto Yoga 2 Piezas Mujer',     imageUrl: U('photo-1544367567-0f2fcb009e0b'), imageHint: 'women yoga two piece set fitness',  category: 'Deportivo', price: 115 },
  { id: 'polo-deportivo-ninos',      description: 'Polo Deportivo Niños Colores',     imageUrl: U('photo-1473492201326-7c01dd2e596b'), imageHint: 'kids colorful sports polo shirt',  category: 'Deportivo', price: 38  },

  // ── ACCESORIOS ──
  { id: 'correa-cuero-marron',    description: 'Correa Cuero Legítimo Marrón',        imageUrl: U('photo-1624222247344-550fb60fe8ff'), imageHint: 'brown genuine leather belt men',  category: 'Accesorios', price: 35 },
  { id: 'bufanda-lana-premium',   description: 'Bufanda Lana Premium Multicolor',     imageUrl: U('photo-1520903920243-00d872a2d1c9'), imageHint: 'colorful premium wool scarf',      category: 'Accesorios', price: 28 },
  { id: 'gorro-tejido-invierno',  description: 'Gorro Tejido Lana Invierno',          imageUrl: U('photo-1510598969022-c4c6c5d05769'), imageHint: 'knit winter wool beanie hat',      category: 'Accesorios', price: 22 },
  { id: 'bolso-tote-canvas',      description: 'Bolso Tote Canvas Mujer',             imageUrl: U('photo-1548036328-c9fa89d128fa'), imageHint: 'canvas tote bag women fashion',    category: 'Accesorios', price: 55 },
  { id: 'medias-pack-x3',         description: 'Medias Pack x3 Algodón Pima',         imageUrl: U('photo-1586350977771-b3b0abd50c82'), imageHint: 'cotton socks pack colorful set',   category: 'Accesorios', price: 25 },
  { id: 'billetera-cuero-hombre', description: 'Billetera Cuero Slim Hombre',         imageUrl: U('photo-1627123424574-724758594e93'), imageHint: 'slim brown leather wallet men',    category: 'Accesorios', price: 45 },
  { id: 'gafas-sol-uv400',        description: 'Gafas de Sol UV400 Unisex',           imageUrl: U('photo-1473496169904-658ba7574b0d'), imageHint: 'uv400 unisex fashion sunglasses',  category: 'Accesorios', price: 38 },
  { id: 'panuelo-seda-mujer',     description: 'Pañuelo Seda Estampado Mujer',        imageUrl: U('photo-1601924582970-9238bcb495d9'), imageHint: 'women printed silk fashion scarf', category: 'Accesorios', price: 32 },
  { id: 'mochila-casual-unisex',  description: 'Mochila Casual Lona Unisex',          imageUrl: U('photo-1553062407-98eeb64c6a62'), imageHint: 'casual canvas backpack unisex',    category: 'Accesorios', price: 72 },
  { id: 'gorra-visera-patli',     description: 'Gorra Visera PAT-LI Colección',       imageUrl: U('photo-1588850561407-ed78c282e89b'), imageHint: 'brand baseball cap collection',    category: 'Accesorios', price: 28 },
];
