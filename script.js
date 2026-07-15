// URL Base del Backend Express que se conecta a SQLite o MongoDB
const API_URL = 'http://localhost:3000';

// Base de Datos de Ciudades Creativas con las 10 locaciones solicitadas
const creativeCitiesData = {
    "Estelí": [
        { name: "Murales de Estelí", category: "artesania", desc: "Galerías a cielo abierto que adornan las paredes de la ciudad expresando historia y cultura viva.", rating: 4.8, visitors: "15,000+ anuales", highlights: ["Arte Urbano", "Muralismo", "Cultura"] },
        { name: "Reserva Natural Tisey-Estanzuela", category: "turistico", desc: "Impresionante salto de agua de más de 35 metros de altura, senderos neblinosos y naturaleza viva.", rating: 4.9, visitors: "20,000+ anuales", highlights: ["Senderismo", "Cascadas", "Agroturismo"] },
        { name: "Taller de Artesanías de Ducuale Grande", category: "artesania", desc: "Reconocido por sus artesanías tradicionales de barro y un fuerte legado indígena[cite: 1].", rating: 4.7, visitors: "5,000+ anuales", highlights: ["Barro", "Legado Indígena", "Tradición"] },
        { name: "Marroquinería y Talabartería", category: "artesania", desc: "Talleres de cuero de fama internacional donde se confeccionan de forma artesanal botas vaqueras y monturas[cite: 1].", rating: 4.8, visitors: "12,000+ anuales", highlights: ["Cuero", "Botas Vaqueras", "Monturas"] },
        { name: "San Juan de Limay", category: "artesania", desc: "Municipio famoso por sus singulares petroglifos como 'La Sirena' y su distintiva artesanía esculpida en piedra marmolina[cite: 1].", rating: 4.7, visitors: "8,000+ anuales", highlights: ["Piedra Marmolina", "Petroglifos", "Esculturas"] },
        { name: "Fábricas de Tabaco (Tabacalera Olivia)", category: "artesania", desc: "Visitas guiadas para conocer el minucioso proceso de elaboración y enrollado artesanal de puros de calidad mundial[cite: 1].", rating: 4.9, visitors: "18,000+ anuales", highlights: ["Puros", "Tabaco", "Tour Guiado"] },
        { name: "Catedral Nuestra Señora del Rosario", category: "historico", desc: "Ubicada frente al Parque Central, data originalmente de 1823 y destaca por su imponente estructura de estilo neoclásico[cite: 1].", rating: 4.6, visitors: "25,000+ anuales", highlights: ["Arquitectura", "Casco Urbano", "Fe"] },
        { name: "Museo de Historia y Arqueología Dr. Alejandro Dávila Bolaños", category: "historico", desc: "Exhibe valiosas piezas arqueológicas, numismática, muestras de arte rupestre y galerías fotográficas de la ciudad[cite: 1].", rating: 4.5, visitors: "6,000+ anuales", highlights: ["Arqueología", "Numismática", "Fotografía"] },
        { name: "Sitio Paleontológico El Bosque (Pueblo Nuevo)", category: "historico", desc: "Considerado uno de los yacimientos paleontológicos más antiguos e importantes de Centroamérica[cite: 1].", rating: 4.7, visitors: "4,000+ anuales", highlights: ["Fósiles", "Prehistoria", "Yacimiento"] },
        { name: "El Jalacate", category: "turistico", desc: "Un espectacular museo de piedra al aire libre tallado pacientemente durante décadas por Don Alberto Gutiérrez 'El Ermitaño'[cite: 1].", rating: 4.9, visitors: "14,000+ anuales", highlights: ["Esculturas", "Naturaleza", "Arte Vivo"] },
        { name: "Reserva Natural Miraflor", category: "turistico", desc: "Santuario selvático de nebliselva, ideal para el agroturismo, senderismo y la observación de una rica biodiversidad de orquídeas y aves[cite: 1].", rating: 4.8, visitors: "11,000+ anuales", highlights: ["Biodiversidad", "Orquídeas", "Aves"] }
    ],
    "León": [
        { name: "Catedral de León", category: "colonial", desc: "La basílica más grande de Centroamérica, joya de la arquitectura barroca y neoclásica[cite: 1].", rating: 4.9, visitors: "95,000+ anuales", highlights: ["Patrimonio UNESCO", "Cúpulas", "Rubén Darío"] },
        { name: "Volcán Cerro Negro", category: "turistico", desc: "El volcán más joven de Centroamérica, ideal para la práctica extrema de sandboarding[cite: 1].", rating: 4.8, visitors: "40,000+ anuales", highlights: ["Sandboarding", "Aventura", "Adrenalina"] },
        { name: "Ruinas de León Viejo", category: "historico", desc: "Asentamiento original de la ciudad sepultado por el volcán Momotombo en 1610[cite: 1].", rating: 4.6, visitors: "18,000+ anuales", highlights: ["Arqueología", "Historia Colonial", "Patrimonio UNESCO"] },
        { name: "Centro de Arte Fundación Ortiz Gurdián", category: "artesania", desc: "Espacio cultural distribuido en hermosas casas coloniales restauradas que exhibe valiosas pinturas, esculturas y artesanías[cite: 1].", rating: 4.9, visitors: "35,000+ anuales", highlights: ["Artes Plásticas", "Casas Coloniales", "Exposiciones"] },
        { name: "Mercado Central de León", category: "artesania", desc: "Punto dinámico ideal para encontrar textiles locales, hamacas, recuerdos tradicionales y la gastronomía típica leonesa[cite: 1].", rating: 4.5, visitors: "55,000+ anuales", highlights: ["Gastronomía", "Textiles", "Recuerdos"] },
        { name: "Artesanías de Sutiaba", category: "artesania", desc: "El histórico barrio conserva profundas tradiciones en la elaboración artesanal de productos de barro, madera y tejidos[cite: 1].", rating: 4.6, visitors: "10,000+ anuales", highlights: ["Barro", "Madera", "Identidad"] },
        { name: "Las Peñitas", category: "turistico", desc: "Una de las playas más visitadas del Pacífico, idónea para la práctica de surf, descanso y contemplar hermosos atardeceres[cite: 1].", rating: 4.7, visitors: "80,000+ anuales", highlights: ["Playa", "Surf", "Atardecer"] },
        { name: "Isla Juan Venado", category: "turistico", desc: "Reserva natural protegida, reconocida por sus extensos manglares, biodiversidad marina y recorridos guiados en lancha[cite: 1].", rating: 4.8, visitors: "15,000+ anuales", highlights: ["Manglares", "Fauna Silvestre", "Ecoturismo"] },
        { name: "Parque Central de León", category: "turistico", desc: "El corazón social y cultural de la ciudad, permanentemente rodeado de solemnes templos y el ambiente universitario[cite: 1].", rating: 4.6, visitors: "120,000+ anuales", highlights: ["Plaza Principal", "Entorno Colonial", "Cultura"] },
        { name: "Iglesia La Recolección", category: "colonial", desc: "Destaca arquitectónicamente por su impresionante y detallada fachada barroca de color amarillo, un ícono de la ciudad[cite: 1].", rating: 4.8, visitors: "40,000+ anuales", highlights: ["Barroco", "Fachada Histórica", "Arte Sacro"] },
        { name: "Iglesia El Calvario", category: "colonial", desc: "Reconocida a nivel internacional por su colorida fachada neoclásica y su enorme valor como patrimonio cultural leonés[cite: 1].", rating: 4.7, visitors: "30,000+ anuales", highlights: ["Colores Vivos", "Patrimonio", "Arquitectura"] },
        { name: "Barrio Indígena de Sutiaba", category: "colonial", desc: "Uno de los asentamientos indígenas más antiguos del país, cuyas calles y tradiciones preservan el legado histórico de León[cite: 1].", rating: 4.6, visitors: "22,000+ anuales", highlights: ["Raíces Indígenas", "Tradición Viva", "Historia"] },
        { name: "Museo Archivo Rubén Darío", category: "historico", desc: "Casa histórica donde habitó el ilustre poeta, dedicada a conservar sus objetos personales, manuscritos y documentos[cite: 1].", rating: 4.9, visitors: "50,000+ anuales", highlights: ["Rubén Darío", "Literatura", "Manuscritos"] },
        { name: "Museo de la Revolución", category: "historico", desc: "Espacio histórico guiado por sus propios protagonistas que relata la cronología política y revolucionaria de Nicaragua[cite: 1].", rating: 4.7, visitors: "35,000+ anuales", highlights: ["Revolución", "Fotografía Histórica", "Guías Vivos"] }
    ],
    "Nagarote": [
        { name: "El Paseo de la Identidad", category: "turistico", desc: "Lugar emblemático para disfrutar de los famosos quesillos tradicionales con tiste en un ambiente folclórico[cite: 1].", rating: 4.7, visitors: "30,000+ anuales", highlights: ["Gastronomía", "Quesillo", "Tradición"] },
        { name: "Templo Parroquial de Santiago", category: "colonial", desc: "Antiguo templo colonial de fachada limpia declarado Monumento Histórico Nacional por su alta relevancia[cite: 1].", rating: 4.5, visitors: "8,000+ anuales", highlights: ["Arquitectura Religiosa", "Monumento Nacional", "Historia"] },
        { name: "Parque Central de Nagarote", category: "turistico", desc: "Reconocido a nivel nacional como el principal punto de encuentro, famoso por su impecable limpieza y orden urbano[cite: 1].", rating: 4.6, visitors: "45,000+ anuales", highlights: ["Limpieza", "Espacio Público", "Familiar"] },
        { name: "Monumento al Quesillo", category: "turistico", desc: "Estructura icónica erigida como símbolo máximo de orgullo para la identidad gastronómica tradicional de Nagarote[cite: 1].", rating: 4.5, visitors: "25,000+ anuales", highlights: ["Monumento", "Identidad", "Cultura Local"] },
        { name: "Malecón de Puerto Momotombo", category: "turistico", desc: "Espacio recreativo a las orillas del lago que ofrece impresionantes vistas panorámicas hacia el imponente Volcán Momotombo[cite: 1].", rating: 4.7, visitors: "20,000+ anuales", highlights: ["Vistas al Volcán", "Lago Xolotlán", "Recreación"] },
        { name: "Antiguas edificaciones del centro urbano", category: "historico", desc: "Inmuebles históricos del casco central que reflejan la evolución arquitectónica y cronológica de la hermosa ciudad[cite: 1].", rating: 4.3, visitors: "5,000+ anuales", highlights: ["Casco Urbano", "Evolución", "Fachadas Clasicas"] }
    ],
    "Managua": [
        { name: "Plaza de la Revolución", category: "historico", desc: "Epicentro de los acontecimientos políticos e históricos más importantes del último siglo[cite: 1].", rating: 4.6, visitors: "60,000+ anuales", highlights: ["Palacio Nacional", "Centro Histórico", "Cultura"] },
        { name: "Puerto Salvador Allende", category: "turistico", desc: "Centro de entretenimiento familiar a las orillas del Lago Xolotlán con restaurantes, quioscos y paseos en bote[cite: 1].", rating: 4.7, visitors: "150,000+ anuales", highlights: ["Malecón", "Cruceros", "Recreación"] },
        { name: "Loma de Tiscapa", category: "historico", desc: "Mirador natural e histórico en la cima de la reserva que ofrece una vista panorámica inigualable de la capital[cite: 1].", rating: 4.6, visitors: "40,000+ anuales", highlights: ["Mirador", "Silueta Sandino", "Historia Militar"] },
        { name: "Laguna de Tiscapa", category: "turistico", desc: "Cuerpo de agua de origen volcánico ubicado como un oasis natural en pleno centro geográfico de Managua[cite: 1].", rating: 4.4, visitors: "25,000+ anuales", highlights: ["Crater", "Canopy", "Naturaleza Urbano"] },
        { name: "Teatro Nacional Rubén Darío", category: "turistico", desc: "Considerado el principal y más moderno centro para la promoción de las artes escénicas y musicales del país[cite: 1].", rating: 4.9, visitors: "55,000+ anuales", highlights: ["Teatro", "Gala", "Conciertos"] },
        { name: "Antigua Catedral de Managua", category: "historico", desc: "Majestuoso esqueleto arquitectónico y símbolo resiliente que evoca la historia de la vieja Managua antes de 1972[cite: 1].", rating: 4.7, visitors: "70,000+ anuales", highlights: ["Neoclásico", "Ruina Histórica", "Fotografía"] },
        { name: "Palacio Nacional de la Cultura", category: "historico", desc: "Edificio de sobria arquitectura que alberga el Museo Nacional, la Biblioteca Nacional y valiosas salas de exposición[cite: 1].", rating: 4.7, visitors: "35,000+ anuales", highlights: ["Museo Nacional", "Arte Precolombino", "Murales"] },
        { name: "Museo Sitio Huellas de Acahualinca", category: "historico", desc: "Zona arqueológica que resguarda las huellas fósiles impresas de humanos y animales de miles de años de antigüedad[cite: 1].", rating: 4.6, visitors: "15,000+ anuales", highlights: ["Huellas Fósiles", "Arqueología", "Ancestros"] },
        { name: "Paseo Xolotlán", category: "turistico", desc: "Extenso parque recreativo que cuenta con hermosas réplicas a escala de los edificios antiguos de la Managua de antaño[cite: 1].", rating: 4.6, visitors: "90,000+ anuales", highlights: ["Maquetas Escala", "Parque Acuático", "Paseo Familiar"] }
    ],
    "Masaya": [
        { name: "Mercado de Artesanías", category: "artesania", desc: "Fortaleza de arquitectura neogótica que alberga hermosas hamacas, indumentaria folclórica y tallados en madera[cite: 1].", rating: 4.8, visitors: "85,000+ anuales", highlights: ["Folclore", "Hamacas Tejidas", "Cuero"] },
        { name: "Parque Nacional Volcán Masaya", category: "turistico", desc: "Uno de los pocos volcanes en el mundo donde se puede ver un incandescente lago de lava activa desde el propio borde[cite: 1].", rating: 4.9, visitors: "120,000+ anuales", highlights: ["Lava Activa", "Cráter Santiago", "Ecoturismo"] },
        { name: "Casa de las Artesanías", category: "artesania", desc: "Centro de enseñanza viva donde se imparten cursos de alfarería, elaboración de máscaras tradicionales de cedazo y juguetería[cite: 1].", rating: 4.7, visitors: "8,000+ anuales", highlights: ["Talleres Vivos", "Máscaras", "Juguetería"] },
        { name: "Plaza de las Artesanías Catarina", category: "artesania", desc: "Ubicada en el municipio de Catarina, funge como un dinámico portal para la promoción y venta del arte y las plantas locales[cite: 1].", rating: 4.8, visitors: "40,000+ anuales", highlights: ["Plantas", "Viveros", "Souvenirs"] },
        { name: "Fortaleza El Coyotepe", category: "historico", desc: "Ubicada a 360 m s. n. m. en la cima del cerro homónimo, es una imponente joya militar repleta de túneles e historia[cite: 1].", rating: 4.6, visitors: "14,000+ anuales", highlights: ["Fortaleza", "Calabozos", "Vista Panorámica"] },
        { name: "Mirador de Catarina", category: "turistico", desc: "Ofrece una de las postales naturales más espectaculares del país hacia la inmensidad de la Laguna de Apoyo[cite: 1].", rating: 4.9, visitors: "110,000+ anuales", highlights: ["Mirador", "Paisaje", "Clima Fresco"] },
        { name: "Laguna de Apoyo", category: "turistico", desc: "Cráter volcánico de aguas cristalinas y templadas ideal para la natación, buceo, kayak y el avistamiento de fauna[cite: 1].", rating: 4.9, visitors: "65,000+ anuales", highlights: ["Aguas Térmicas", "Naturaleza", "Kayak"] },
        { name: "Parque Central de Masaya", category: "turistico", desc: "Espacio tradicional permanentemente impregnado del folklore, rodeado de iglesias coloniales y sabrosa gastronomía[cite: 1].", rating: 4.5, visitors: "50,000+ anuales", highlights: ["Monimbó", "Vigorón", "Tradición"] },
        { name: "El Ventarrón (La Concepción)", category: "turistico", desc: "Paraje natural destacado por sus fuertes corrientes de viento, miradores improvisados y agradable microclima fresco[cite: 1].", rating: 4.6, visitors: "12,000+ anuales", highlights: ["Viento", "Montaña", "Panorámica"] },
        { name: "Antigua Estación del Ferrocarril", category: "historico", desc: "Edificación restaurada que conmemora la dorada época comercial del Ferrocarril del Pacífico de Nicaragua[cite: 1].", rating: 4.4, visitors: "9,000+ anuales", highlights: ["Estación", "Ferrocarril", "Patrimonio"] }
    ],
    "Granada": [
        { name: "Calle La Calzada", category: "colonial", desc: "Fundada en 1524, caracterizada por sus imponentes fachadas andaluzas de vivos colores y activa oferta culinaria[cite: 1].", rating: 4.9, visitors: "110,000+ anuales", highlights: ["Casonas Coloniales", "Peatonal", "Vida Nocturna"] },
        { name: "Las Isletas de Granada", category: "turistico", desc: "Archipiélago de 365 pequeñas islas de origen volcánico en el Gran Lago de Nicaragua, ricas en flora y fauna[cite: 1].", rating: 4.8, visitors: "75,000+ anuales", highlights: ["Paseo en lancha", "Isla de los monos", "Naturaleza"] },
        { name: "Mercado Municipal de Granada", category: "artesania", desc: "Histórico edificio neoclásico en cuyo bullicioso interior se consiguen finas hamacas, calzado artesanal y dulces típicos[cite: 1].", rating: 4.5, visitors: "40,000+ anuales", highlights: ["Hamacas", "Calzado", "Dulces Tradicionales"] },
        { name: "Casa de los Tres Mundos", category: "artesania", desc: "Palacio cultural colonial reconvertido en fundación internacional para incentivar la música, el teatro y las artes plásticas[cite: 1].", rating: 4.8, visitors: "16,000+ anuales", highlights: ["Conciertos", "Galería de Arte", "Talleres"] },
        { name: "Volcán Mombacho", category: "turistico", desc: "Imponente reserva natural con ecosistema de bosque de nebliselva, senderos biológicos y miradores espectaculares[cite: 1].", rating: 4.9, visitors: "35,000+ anuales", highlights: ["Bosque Nublado", "Canopy", "Orquídeas Endémicas"] },
        { name: "Catedral de Granada", category: "colonial", desc: "La icónica e histórica catedral neoclásica de vivos colores amarillo y rojo que preside el Parque Central[cite: 1].", rating: 4.9, visitors: "130,000+ anuales", highlights: ["Icono Visual", "Fotografía", "Centro Histórico"] },
        { name: "Parque Central de Granada", category: "turistico", desc: "Punto de encuentro por excelencia de la Gran Sultana, famoso por sus coches de caballos y el emblemático vigorón en hoja de chaguite[cite: 1].", rating: 4.7, visitors: "140,000+ anuales", highlights: ["Coches de Caballos", "Vigorón", "Kioscos"] },
        { name: "Malecón de Granada", category: "turistico", desc: "Extenso paseo costero acondicionado para el esparcimiento familiar directo frente a las olas del inmenso Lago Cocibolca[cite: 1].", rating: 4.5, visitors: "60,000+ anuales", highlights: ["Lago Cocibolca", "Brisa", "Recreación"] },
        { name: "Museo del Chocolate", category: "turistico", desc: "Establecimiento temático interactivo donde se enseña detalladamente la transformación artesanal del grano de cacao orgánico[cite: 1].", rating: 4.6, visitors: "28,000+ anuales", highlights: ["Cacao", "Chocolates", "Interactivo"] },
        { name: "Convento y Museo San Francisco", category: "colonial", desc: "Antiguo e histórico convento franciscano que resguarda una impresionante colección de estatuas precolombinas monolíticas[cite: 1].", rating: 4.8, visitors: "24,000+ anuales", highlights: ["Estatuas Idolos", "Catacumbas", "Historia Religiosa"] },
        { name: "Iglesia de Guadalupe", category: "colonial", desc: "Emblemático templo erigido en la época colonial, escenario de cruentos combates históricos y ubicado al final de La Calzada[cite: 1].", rating: 4.7, visitors: "45,000+ anuales", highlights: ["Fachada Antigua", "Combates Históricos", "Fin de la Calzada"] },
        { name: "Iglesia La Merced", category: "colonial", desc: "Templo colonial de soberbia fachada barroca; el ascenso a su campanario brinda la mejor vista aérea de la ciudad[cite: 1].", rating: 4.8, visitors: "38,000+ anuales", highlights: ["Campanario", "Vista Aérea", "Barroco"] },
        { name: "Fortaleza La Pólvora", category: "colonial", desc: "Estructura militar fortificada construida originalmente por los españoles para almacenar municiones y defenderse de piratas[cite: 1].", rating: 4.6, visitors: "14,000+ anuales", highlights: ["Torreones", "Antiguo Cuartel", "Defensa Pirata"] },
        { name: "Casa Natal Sor María Romero", category: "historico", desc: "Sitio de gran peregrinaje religioso y valor histórico dedicado a conservar el legado espiritual de la beata granadina[cite: 1].", rating: 4.8, visitors: "18,000+ anuales", highlights: ["Peregrinación", "Beata", "Santuario"] },
        { name: "Antigua Estación del Ferrocarril", category: "historico", desc: "Bello edificio de corte neoclásico que atesora el recuerdo del auge e impacto socioeconómico del sistema ferroviario[cite: 1].", rating: 4.5, visitors: "11,000+ anuales", highlights: ["Arquitectura Europea", "Locomotora", "Patrimonio"] },
        { name: "Capilla San Juan Bosco", category: "historico", desc: "Acogedor templo religioso catalogado como un pilar histórico de fuerte arraigo espiritual dentro de la comunidad local[cite: 1].", rating: 4.4, visitors: "5,000+ anuales", highlights: ["Comunidad", "Espiritualidad", "Arquitectura Sacra"] }
    ],
    "San Juan de Oriente": [
        { name: "Talleres Alfareros Tradicionales", category: "artesania", desc: "El pueblo entero se dedica al modelado de cerámica utilitaria y decorativa con motivos precolombinos usando el torno de pie[cite: 1].", rating: 4.9, visitors: "40,000+ anuales", highlights: ["Barro Esculpido", "Tornos Tradicionales", "Alfarería"] },
        { name: "Casa del Artesano", category: "artesania", desc: "Espacio integral diseñado exclusivamente para la exposición permanente, fomento y comercialización de la fina artesanía local[cite: 1].", rating: 4.7, visitors: "15,000+ anuales", highlights: ["Exhibición", "Identidad Cultural", "Souvenirs"] },
        { name: "Galerías de Cerámica", category: "artesania", desc: "Elegantes salas de exhibición donde reconocidos maestros ceramistas exponen exclusivas piezas de barro decoradas a mano[cite: 1].", rating: 4.8, visitors: "18,000+ anuales", highlights: ["Cerámica Artística", "Piezas Únicas", "Maestros"] },
        { name: "Mirador de San Juan de Oriente", category: "turistico", desc: "Balcón natural elevado que regala majestuosas e idílicas panorámicas del espejo de agua de la Laguna de Apoyo[cite: 1].", rating: 4.8, visitors: "35,000+ anuales", highlights: ["Vista Panorámica", "Fotografía", "Laguna Apoyo"] },
        { name: "Laguna de Apoyo", category: "turistico", desc: "Atractivo depósito de agua dulce natural de origen cratérico compartido, muy idóneo para actividades ecoturísticas[cite: 1].", rating: 4.9, visitors: "20,000+ anuales", highlights: ["Ecoturismo", "Refugio Natural", "Baño Al Aire Libre"] },
        { name: "Rutas Artesanales del Pueblo", category: "turistico", desc: "Circuitos peatonales guiados a través de las calles del municipio para experimentar el proceso del barro en vivo[cite: 1].", rating: 4.7, visitors: "12,000+ anuales", highlights: ["Caminata Cultural", "Talleres Familiares", "Experiencia Viva"] },
        { name: "Iglesia San Juan Bautista", category: "historico", desc: "Principal referente histórico, arquitectónico y religioso de la comunidad, famoso por sus arraigadas fiestas patronales[cite: 1].", rating: 4.6, visitors: "9,000+ anuales", highlights: ["Chinegros", "Patrono", "Fe y Tradición"] }
    ],
    "Juigalpa": [
        { name: "Museo Arqueológico Gregorio Aguilar Barea", category: "historico", desc: "Resguarda la colección más grande de estatuaria amerindia procedente de la cordillera de Amerrisque[cite: 1].", rating: 4.7, visitors: "12,000+ anuales", highlights: ["Ídolos de Piedra", "Petroglifos", "Cultura Prehispánica"] },
        { name: "Mercado Municipal de Juigalpa", category: "artesania", desc: "Punto comercial idóneo para adquirir auténticos quesos chontaleños, dulces y diversas artesanías utilitarias[cite: 1].", rating: 4.4, visitors: "22,000+ anuales", highlights: ["Lácteos", "Comercio Local", "Gastronomía"] },
        { name: "Talleres de Talabartería y Cuero", category: "artesania", desc: "Reconocidos locales dedicados enteramente a la fabricación manual de monturas, albardas, botas y fajas de alta calidad[cite: 1].", rating: 4.8, visitors: "9,000+ anuales", highlights: ["Talabartería", "Monturas Vaqueras", "Cuero Labrado"] },
        { name: "Parque Central de Juigalpa", category: "turistico", desc: "El principal punto urbano de convergencia comunitaria, rodeado de frondosos árboles y un ambiente ganadero[cite: 1].", rating: 4.5, visitors: "35,000+ anuales", highlights: ["Kiosco", "Entorno Urbano", "Paseo Familiar"] },
        { name: "Catedral de Juigalpa", category: "historico", desc: "Imponente templo católico de gran importancia religiosa e histórica que domina el paisaje del centro chontaleño[cite: 1].", rating: 4.6, visitors: "20,000+ anuales", highlights: ["Catedral", "Arquitectura Sacra", "Fe Chontaleña"] },
        { name: "Parque Zoológico Thomas Belt", category: "turistico", desc: "Uno de los zoológicos más importantes de Nicaragua, enfocado en el rescate y preservación de fauna exótica y nativa[cite: 1].", rating: 4.8, visitors: "45,000+ anuales", highlights: ["Animales Exóticos", "Conservación", "Educación Ambiental"] }
    ],
    "Matagalpa": [
        { name: "Ruta del Café en Selva Negra", category: "turistico", desc: "Finca ecológica neblinosa donde se aprende sobre el cultivo y procesamiento del grano de oro en un bosque nublado[cite: 1].", rating: 4.8, visitors: "25,000+ anuales", highlights: ["Montaña", "Cataratas", "Ecoturismo"] },
        { name: "Mercado Municipal de Matagalpa", category: "artesania", desc: "Establecimiento popular perfecto para adquirir tejidos rústicos norteños, artesanías variadas y café recién tostado[cite: 1].", rating: 4.5, visitors: "30,000+ anuales", highlights: ["Café Tostado", "Tejidos Norteños", "Artesanía Rústica"] },
        { name: "Reserva Natural Cerro Apante", category: "turistico", desc: "Área protegida que ofrece retadores senderos ecológicos, densa flora, fauna silvestre y un mirador con la Cruz de la Paz[cite: 1].", rating: 4.7, visitors: "14,000+ anuales", highlights: ["Senderismo Extremo", "Cruz De La Paz", "Cascadas"] },
        { name: "Cascada Blanca", category: "turistico", desc: "Preciosa e icónica caída de agua natural envuelta en mitos indígenas, acondicionada con senderos y una mística cueva interna[cite: 1].", rating: 4.8, visitors: "22,000+ anuales", highlights: ["Salto de Agua", "Cueva Mística", "Fotografía De Paisaje"] },
        { name: "Parque Morazán", category: "historico", desc: "Espacio público histórico, rodeado de la centenaria catedral y escenario de significativos acontecimientos cívicos[cite: 1].", rating: 4.5, visitors: "45,000+ anuales", highlights: ["Plaza Cívica", "Historia Norteña", "Sombra Natural"] },
        { name: "Museo del Café de Matagalpa", category: "turistico", desc: "Centro interpretativo dedicado exclusivamente a relatar la historia del café y su drástico impacto en el norte de Nicaragua[cite: 1].", rating: 4.6, visitors: "11,000+ anuales", highlights: ["Historia Cafetalera", "Maquinaria Antigua", "Cultura"] },
        { name: "Teatro Municipal de Matagalpa", category: "turistico", desc: "Moderno e indispensable epicentro urbano diseñado para conciertos folklóricos, obras teatrales y galas culturales[cite: 1].", rating: 4.6, visitors: "13,000+ anuales", highlights: ["Teatro", "Conciertos Folclóricos", "Eventos"] },
        { name: "Catedral San Pedro Apóstol", category: "historico", desc: "La tercera catedral más grande de Nicaragua, joya arquitectónica ecléctica de alto e invaluable valor histórico[cite: 1].", rating: 4.8, visitors: "35,000+ anuales", highlights: ["Monumento Histórico", "Ecléctico", "Patrimonio Religioso"] }
    ],
    "Bluefields": [
        { name: "Cultura y Danza del Mayo Ya", category: "artesania", desc: "Expresión cultural, trajes e instrumentos caribeños que representan la herencia afrodescendiente e indígena[cite: 1].", rating: 4.8, visitors: "14,000+ anuales", highlights: ["Danza Tradicional", "Gastronomía Caribeña", "Madera de Carey"] },
        { name: "Mercado Municipal de Bluefields", category: "artesania", desc: "Colorido punto de convergencia étnica donde se expenden comidas caribeñas y souvenirs de madera de rosa y coco[cite: 1].", rating: 4.4, visitors: "18,000+ anuales", highlights: ["Multicultural", "Pan De Coco", "Madera De Rosa"] },
        { name: "Centro Cultural de Bluefields", category: "artesania", desc: "Espacio comunitario consagrado enteramente a la preservación de la música creole y las danzas tradicionales caribeñas[cite: 1].", rating: 4.7, visitors: "6,000+ anuales", highlights: ["Música Creole", "Danzas", "Talleres Identitarios"] },
        { name: "Bahía de Bluefields", category: "turistico", desc: "Estuario natural vital para la navegación regional, paseos marítimos y la observación de hermosos paisajes costeros[cite: 1].", rating: 4.5, visitors: "25,000+ anuales", highlights: ["Estuario", "Paseos En Bote", "Paisajes"] },
        { name: "Isla del Venado", category: "turistico", desc: "Pequeña e idílica isla ubicada en la bahía, valorada localmente por sus playas vírgenes y pacífico entorno natural[cite: 1].", rating: 4.6, visitors: "8,000+ anuales", highlights: ["Isla Virgen", "Naturaleza", "Playa Escondida"] },
        { name: "Parque Reyes", category: "historico", desc: "El histórico y principal parque central urbano, epicentro de las masivas celebraciones del tradicional Palo de Mayo[cite: 1].", rating: 4.6, visitors: "35,000+ anuales", highlights: ["Palo De Mayo", "Punto De Encuentro", "Historia Caribeña"] },
        { name: "Paseo Costero de Bluefields", category: "turistico", desc: "Malecón peatonal ideal para caminar relajadamente disfrutando de la fresca brisa del mar Caribe y botes pesqueros[cite: 1].", rating: 4.5, visitors: "22,000+ anuales", highlights: ["Malecón", "Brisa Marina", "Caminata"] },
        { name: "Laguna de Bluefields", category: "turistico", desc: "Rico ecosistema acuático rodeado de frondosos manglares, ideal para el avistamiento de aves y la pesca deportiva[cite: 1].", rating: 4.5, visitors: "10,000+ anuales", highlights: ["Manglares Densos", "Avistamiento Aves", "Pesca"] },
        { name: "Palacio Municipal de Bluefields", category: "historico", desc: "Emblemático inmueble institucional del casco urbano que resguarda el patrimonio arquitectónico y administrativo caribeño[cite: 1].", rating: 4.3, visitors: "4,000+ anuales", highlights: ["Palacio", "Arquitectura Civil", "Administración"] },
        { name: "Iglesia Morava de Bluefields", category: "historico", desc: "Histórico y representativo templo de madera, pilar fundamental en la identidad cultural y espiritual costeña[cite: 1].", rating: 4.8, visitors: "15,000+ anuales", highlights: ["Templo Histórico", "Estructura Madera", "Arraigo Moravo"] },
        { name: "Antiguo Puerto de Bluefields", category: "historico", desc: "Zona patrimonial que rememora el auge de la conectividad marítima y mercantil internacional de la Costa Caribe[cite: 1].", rating: 4.4, visitors: "7,000+ anuales", highlights: ["Muelle Histórico", "Comercio Marítimo", "Historia Marítima"] },
        { name: "Museo Regional de la Costa Caribe", category: "historico", desc: "Fascinante espacio que documenta la cronología de la autonomía de los pueblos miskitos, sumus, ramas y creoles[cite: 1].", rating: 4.8, visitors: "9,000+ anuales", highlights: ["Autonomía Caribeña", "Trajes Ancestrales", "Etnias"] }
    ]
};

document.addEventListener("DOMContentLoaded", () => {
    const activeDepartments = document.querySelectorAll('.dept-active');
    const legendBox = document.getElementById('map-legend');

    activeDepartments.forEach(dept => {
        // 1. Efecto visual en la leyenda al pasar el mouse
        dept.addEventListener('mouseenter', (e) => {
            const areaName = e.target.getAttribute('name');
            legendBox.textContent = `Explorar: ¡${areaName}!`;
            legendBox.classList.add('active');
        });

        dept.addEventListener('mouseleave', () => {
            legendBox.textContent = "Pasa el cursor sobre un departamento destacado";
            legendBox.classList.remove('active');
        });

        // 2. Evento Clic para Redireccionar e integrar con el Select
        dept.addEventListener('click', (e) => {
            const targetCity = e.target.getAttribute('data-city');

            // Cambiamos de vista a Ciudades Creativas utilizando tu enrutador nativo
            if (typeof navigateTo === "function") {
                navigateTo('/ciudades-creativas'); 
            }

            // Esperamos que la vista se monte/active
            setTimeout(() => {
                const selectCity = document.getElementById('select-city');
                
                if (selectCity) {
                    // Seleccionamos la ciudad correspondiente en el <select>
                    selectCity.value = targetCity;
                    
                    // Reseteamos el filtro de categorías a 'todos' para consistencia estética
                    if (typeof changeCategoryFilter === "function") {
                        changeCategoryFilter('todos');
                    }

                    // Forzamos el renderizado dinámico de tus tarjetas
                    if (typeof filterCreativeSites === "function") {
                        filterCreativeSites();
                    }
                    
                    // Desplazamiento suave para enfocar el título de la sección
                    const sitesTitle = document.getElementById('sites-title');
                    if (sitesTitle) {
                        sitesTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            }, 180); // Sincronización perfecta de milisegundos con la transición de la vista
        });
    });
});
const aiResponses = {
    "granada": "En Granada te recomiendo visitar la Calle La Calzada, subir a la torre de la Iglesia de la Merced para ver los tejados coloniales, y comer un tradicional **Vigorón en el Parque Central**.",
    "cerro negro": "Para el volcán Cerro Negro en León, debés prepararte para caminar unos 45 minutos sobre piedra volcánica suelta. Arriba te deslizás en una tabla de madera a más de 60 km/h.",
    "barro": "El corazón de las artesanías de barro es **San Juan de Oriente** en Masaya. Ahí podés entrar directamente a los talleres de los artesanos locales y ver cómo usan el torno de pie.",
    "corn island": "La mejor época para ir a Corn Island es en los meses de **marzo, abril y mayo**, cuando el mar Caribe está súper calmo y hay muy pocas lluvias.",
    "default": "¡Qué buenísima pregunta! Nicaragua tiene destinos increíbles. Te sugiero explorar nuestras secciones para encontrar exactamente lo que buscás."
};

let likedItemsInSession = []; 
let currentCategoryFilter = 'todos';

/* --- SISTEMA DE NOTIFICACIONES TOAST INTEGRADO --- */
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-card ${type}`;
    const icon = type === 'success' ? '🎉' : '❌';

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        });
    }, 4000);
}

function navigateTo(viewId) {
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
        v.style.display = 'none';
    });

    const idMap = {
        '/': 'view-home',
        '/mapa-interactivo': 'view-map',
        '/ciudades-creativas': 'view-sites',
        '/galeria': 'view-gallery',
        '/ia-guia': 'view-ia',
        '/registro': 'view-auth'
    };

    const targetId = idMap[viewId] || 'view-404';
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
        targetElement.style.display = 'block';
        targetElement.classList.add('active');
    }

    if(viewId === '/galeria') renderGallery();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

/* --- INTERFAZ FILTRADORA DE CIUDADES CREATIVAS --- */
function changeCategoryFilter(category) {
    currentCategoryFilter = category;
    const buttons = document.querySelectorAll('.tab-filter');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    if(category === 'todos') document.getElementById('filter-all')?.classList.add('active');
    if(category === 'turistico') document.getElementById('filter-tur')?.classList.add('active');
    if(category === 'colonial') document.getElementById('filter-col')?.classList.add('active');
    if(category === 'historico') document.getElementById('filter-his')?.classList.add('active');
    if(category === 'artesania') document.getElementById('filter-art')?.classList.add('active');

    filterCreativeSites();
}

function filterCreativeSites() {
    const selectCityElem = document.getElementById('select-city');
    if (!selectCityElem) return;

    const selectedCity = selectCityElem.value;
    const container = document.getElementById('sites-render-container');
    if (!container) return;
    
    container.innerHTML = '';
    const sites = creativeCitiesData[selectedCity] || [];
    
    const filteredSites = sites.filter(site => {
        if (currentCategoryFilter === 'todos') return true;
        return site.category === currentCategoryFilter;
    });

    if(filteredSites.length === 0) {
        container.innerHTML = `
            <div class="no-data-alert">
                <i data-lucide="info"></i> No hay registros cargados bajo la categoría "<b>${currentCategoryFilter.toUpperCase()}</b>" en <b>${selectedCity}</b>.
            </div>`;
        if (window.lucide) lucide.createIcons();
        return;
    }

    filteredSites.forEach(site => {
        const card = document.createElement('div');
        card.className = `site-card border-${site.category}`;
        let tagsHTML = '';
        site.highlights.forEach(h => { tagsHTML += `<span class="tag">${h}</span>`; });

        card.innerHTML = `
            <div class="site-title">${site.name} <span class="badge-cat">${site.category.toUpperCase()}</span></div>
            <div class="site-meta">
                <span class="rating"><i data-lucide="star" style="width: 1rem; height: 1rem; fill: currentColor;"></i> ${site.rating}</span>
                <span class="visitors"><i data-lucide="users" style="width: 1rem; height: 1rem;"></i> ${site.visitors}</span>
            </div>
            <div class="site-desc">${site.desc}</div>
            <div class="highlights">${tagsHTML}</div>
        `;
        container.appendChild(card);
    });
    if (window.lucide) lucide.createIcons();
}

/* --- RENDERIZAR GALERÍA --- */
async function renderGallery() {
    const container = document.getElementById('gallery-render-container');
    if (!container) return;

    try {
        const res = await fetch(`${API_URL}/api/gallery`);
        if (!res.ok) throw new Error(`Error en respuesta: ${res.status}`);
        const items = await res.json();

        if (items.length === 0) {
            container.innerHTML = `<p class="no-data-alert">Aún no hay momentos en la bitácora. ¡Sé el primero!</p>`;
            return;
        }

        container.innerHTML = items.map(item => {
            const esVideo = item.url && item.url.startsWith('data:video/');
            const recursoMultimedia = esVideo 
                ? `<video src="${item.url}" controls muted loop class="card-media"></video>`
                : `<img src="${item.url}" alt="${item.location}" class="card-media" onerror="this.src='https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800';">`;

            const saveActive = item.is_saved === 1 ? 'active' : '';
            const saveStyle = item.is_saved === 1 ? 'style="fill: #fbbf24; color: #fbbf24;"' : '';

            return `
                <div class="gallery-card">
                    <div class="card-image-wrapper">
                        ${recursoMultimedia}
                    </div>
                    <div class="card-content">
                        <h3>${item.location || 'Destino'}</h3>
                        <p>${item.description || 'Sin descripción.'}</p>
                        <div class="card-actions-bar">
                            <button class="action-btn like-btn" onclick="toggleLike(this, ${item.id})">
                                <i data-lucide="heart"></i>
                                <span class="count-label">${item.likes || 0}</span>
                            </button>
                            <button class="action-btn comment-btn" onclick="openComments(${item.id})">
                                <i data-lucide="message-circle"></i>
                                <span class="count-label">${item.comments_count || 0}</span>
                            </button>
                            <button class="action-btn save-btn ${saveActive}" onclick="toggleSave(this, ${item.id})">
                                <i data-lucide="bookmark" ${saveStyle}></i>
                            </button>
                        </div>
                        <div class="card-footer">
                            <span class="explorer-tag"><i class="lucide-user"></i> @Explorador</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        if (window.lucide) lucide.createIcons();
    } catch (err) {
        console.error("Error al renderizar galería:", err);
        container.innerHTML = `<p class="no-data-alert" style="color: #ff4a4a;">Error al cargar la base de datos.</p>`;
    }
}

async function toggleLike(btn, id) {
    const icon = btn.querySelector('i');
    const countLabel = btn.querySelector('.count-label');
    let currentLikes = parseInt(countLabel.innerText);
    btn.classList.toggle('active');
    let valorCambio = btn.classList.contains('active') ? 1 : -1;
    
    currentLikes += valorCambio;
    countLabel.innerText = currentLikes;
    
    if (btn.classList.contains('active')) {
        icon.style.fill = '#ef4444';
        icon.style.color = '#ef4444';
    } else {
        icon.style.fill = 'none';
        icon.style.color = 'currentColor';
    }

    try {
        await fetch(`${API_URL}/api/gallery/${id}/action`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'like', value: valorCambio })
        });
    } catch (error) {
        console.error("Error al guardar el like en la BD:", error);
    }
}

async function toggleSave(btn, id) {
    btn.classList.toggle('active');
    const icon = btn.querySelector('i');
    const estaGuardado = btn.classList.contains('active');
    
    if (estaGuardado) {
        icon.style.fill = '#fbbf24';
        icon.style.color = '#fbbf24';
        showToast("Destino guardado en tu colección");
    } else {
        icon.style.fill = 'none';
        icon.style.color = 'currentColor';
        showToast("Removido de tu colección", "error");
    }

    try {
        await fetch(`${API_URL}/api/gallery/${id}/action`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'save', value: estaGuardado })
        });
    } catch (error) {
        console.error("Error al guardar en colecciones:", error);
    }
}

function openModal() {
    const modal = document.getElementById('upload-modal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.remove('hidden');
    }
}
function closeModal() { document.getElementById('upload-modal')?.classList.add('hidden'); }
function closeModalOnOverlay(e) { if (e.target.id === 'upload-modal') closeModal(); }

async function handleUploadSubmit(event) {
    event.preventDefault();
    const locationInput = document.getElementById('form-location');
    const fileInput = document.getElementById('form-file');
    const descInput = document.getElementById('form-desc');

    if (!locationInput || !fileInput || !descInput || !fileInput.files[0]) {
        showToast("Por favor, selecciona un archivo de tu dispositivo.", "error");
        return;
    }

    const archivo = fileInput.files[0];
    const convertToBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });

    try {
        const btnSubmit = event.target.querySelector('button[type="submit"]');
        const textoOriginal = btnSubmit.innerText;
        btnSubmit.innerText = "PROCESANDO ARCHIVO...";
        btnSubmit.disabled = true;

        const base64Data = await convertToBase64(archivo);
        const payload = {
            url: base64Data,
            location: locationInput.value.trim(),
            description: descInput.value.trim()
        };

        const response = await fetch(`${API_URL}/api/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (response.ok && data.success) {
            showToast('¡Tu momento viajero ha sido publicado con éxito!');
            locationInput.value = '';
            fileInput.value = '';
            descInput.value = '';
            closeModal();
            renderGallery();
        } else {
            showToast(`Error: ${data.error || 'No se pudo guardar.'}`, "error");
        }
        btnSubmit.innerText = textoOriginal;
        btnSubmit.disabled = false;
    } catch (error) {
        console.error('Error al procesar el archivo local:', error);
        showToast('Hubo un error de red o el archivo es demasiado pesado.', "error");
    }
}

/* ==========================================================================
    NUEVO DISPARADOR CENTRALIZADO DE SESIÓN (SOLUCIONA TU BUG DE NAVEGACIÓN)
   ========================================================================== */
function checkSession() {
    const session = localStorage.getItem('viajero_session');
    const formsContainer = document.getElementById('auth-forms-container');
    const profileContainer = document.getElementById('auth-profile-container');
    
    // Buscar el botón de registro/perfil en la barra superior (Navbar)
    const navAuthLink = document.querySelector('a[onclick*="/registro"]') || document.querySelector('.nav-links a:last-child');

    if (session) {
        const user = JSON.parse(session);
        
        // Intercambiar formularios de Login por la Vista de Perfil
        if (formsContainer) formsContainer.style.display = 'none';
        if (profileContainer) profileContainer.style.display = 'block';

        // Modificar dinámicamente el botón "Registro" de arriba por tu Nombre de cuenta
        if (navAuthLink) {
            navAuthLink.innerHTML = `<span id="nav-auth-text">@${user.username}</span>`;
        }

        // --- ACTUALIZACIÓN EXCLUSIVA PARA EL AVATAR PERSISTENTE ---
        const profileImg = document.getElementById('profile-avatar-img');
        if (profileImg) {
            // Si el usuario tiene un avatar guardado en Base64, lo usa; si no, deja el por defecto
            profileImg.src = user.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=viajero";
        }
        // ---------------------------------------------------------

        // Pintar la información del usuario en la tarjeta de perfil
        actualizarCajaPerfilInterfaz(user);
    } else {
        // Si no hay sesión, reestablecer todo al estado nativo
        if (formsContainer) formsContainer.style.display = 'grid';
        if (profileContainer) profileContainer.style.display = 'none';
        if (navAuthLink) {
            navAuthLink.innerHTML = `<span id="nav-auth-text">Registro</span>`;
        }
    }
}

/* ==========================================================================
    CONTROLADORES DE AUTENTICACIÓN ADAPTADOS A LOS IDs DEL HTML
   ========================================================================== */

async function handleRegister(event) {
    event.preventDefault();
    
    // Captura con los IDs exactos del HTML proporcionado (reg-)
    const usernameInput = document.getElementById('reg-username');
    const emailInput = document.getElementById('reg-email');
    const passwordInput = document.getElementById('reg-password');

    if (!usernameInput || !emailInput || !passwordInput) {
        showToast('Error interno: No se mapearon las cajas de texto.', 'error');
        return;
    }

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !email || !password) {
        showToast('Por favor, rellena todos los campos de registro.', 'error');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();

        if (res.ok && data.success) {
            showToast('¡Cuenta creada con éxito! Iniciando sesión automáticamente...');
            
            // Auto-login o sincronización tras registrarse con éxito:
            const loginEmailInput = document.getElementById('login-email');
            const loginPassInput = document.getElementById('login-password');
            
            if (loginEmailInput) loginEmailInput.value = email;
            event.target.reset(); // Limpia los inputs del bloque de registro
            
            if (loginPassInput) {
                loginPassInput.focus();
            }
        } else {
            showToast(data.error || 'No se pudo crear la cuenta.', 'error');
        }
    } catch (error) {
        console.error('Error en registro:', error);
        showToast('Error de comunicación con el servidor.', 'error');
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    // Captura con los IDs exactos del HTML proporcionado (login-)
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');

    if (!emailInput || !passwordInput) {
        showToast('Error interno: Campos de login ausentes.', 'error');
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        showToast('Por favor, ingresa tu correo y contraseña.', 'error');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok && data.success) {
            showToast(`¡Bienvenido de nuevo, ${data.user.username}!`);
            
            // Guardamos la sesión activa usando tu clave global viajero_session
            localStorage.setItem('viajero_session', JSON.stringify(data.user));
            event.target.reset();
            
            // Actualizar la interfaz del navbar y perfil de inmediato
            checkSession();
            navigateTo('/'); // Redirige al inicio o sección deseada
        } else {
            showToast(data.error || "Credenciales incorrectas.", "error");
        }
    } catch (error) {
        console.error('Error en login:', error);
        showToast("Error de autenticación con el servidor.", "error");
    }
}

function handleLogout() {
    localStorage.removeItem('viajero_session');
    showToast("Sesión terminada. ¡Vuelve pronto!");
    checkSession();
    navigateTo('/');
}

function actualizarCajaPerfilInterfaz(user) {
    const usernameEl = document.getElementById('val-username');
    const cityEl = document.getElementById('val-city');
    const editUserInp = document.getElementById('edit-username');
    const editCityInp = document.getElementById('edit-city');
    const avatarImg = document.getElementById('profile-avatar-img');
    
    if (user) {
        if (usernameEl) usernameEl.innerText = `@${user.username}`;
        if (cityEl) cityEl.innerText = user.city || 'Granada';
        if (editUserInp) editUserInp.value = user.username;
        if (editCityInp) editCityInp.value = user.city || '';
        
        if (avatarImg) {
            avatarImg.src = user.avatar && user.avatar.trim() !== "" 
                ? user.avatar 
                : "https://api.dicebear.com/7.x/bottts/svg?seed=" + user.username;
        }
    }
}
/* ==========================================================================
    CAMBIO DINÁMICO Y PERSISTENCIA DEL AVATAR / LOGO DE PERFIL
   ========================================================================== */

function uploadAvatar() {
    const fileInput = document.getElementById('avatar-input');
    const profileImg = document.getElementById('profile-avatar-img');

    // Verificar que el input exista y que el usuario haya seleccionado un archivo
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        return;
    }

    const archivo = fileInput.files[0];

    // Validar que realmente sea una imagen
    if (!archivo.type.startsWith('image/')) {
        showToast('Por favor, selecciona un archivo de imagen válido (PNG, JPG).', 'error');
        return;
    }

    // Instanciar FileReader para leer el archivo local sin necesidad de subirlo al servidor aún
    const reader = new FileReader();

    // Cuando termine de leer el archivo de la PC/celular del usuario
    reader.onload = function(e) {
        const imagenBase64 = e.target.result;

        // 1. Cambiar el logo visualmente en caliente en la pantalla
        if (profileImg) {
            profileImg.src = imagenBase64;
        }

        // 2. Persistir el cambio en el LocalStorage para que se mantenga al recargar la página
        const sessionData = localStorage.getItem('viajero_session');
        if (sessionData) {
            try {
                const user = JSON.parse(sessionData);
                user.avatar = imagenBase64; // Guardamos el string Base64 en el objeto del usuario
                localStorage.setItem('viajero_session', JSON.stringify(user));
                
                showToast('¡Imagen de perfil actualizada con éxito!');
            } catch (error) {
                console.error('Error al actualizar avatar en la sesión:', error);
            }
        }
    };

    // Iniciar la lectura del archivo como URL de datos
    reader.readAsDataURL(archivo);
}

function toggleEdit() {
    const session = localStorage.getItem('viajero_session');
    if (!session) return;
    const user = JSON.parse(session);

    const viewMode = document.getElementById('profile-view-mode');
    const editMode = document.getElementById('profile-edit-mode');
    const btnEdit = document.getElementById('btn-edit');
    const btnSave = document.getElementById('btn-save');

    if (viewMode.style.display !== 'none') {
        document.getElementById('edit-username').value = user.username;
        document.getElementById('edit-city').value = user.city || '';
        
        viewMode.style.display = 'none';
        editMode.style.display = 'block';
        btnEdit.innerText = "Cancelar";
        btnSave.style.display = 'inline-block';
    } else {
        viewMode.style.display = 'block';
        editMode.style.display = 'none';
        btnEdit.innerText = "Editar Perfil";
        btnSave.style.display = 'none';
    }
}

async function saveProfile() {
    const session = localStorage.getItem('viajero_session');
    if (!session) return;
    const user = JSON.parse(session);

    const nuevoUser = document.getElementById('edit-username').value.trim();
    const nuevaCiudad = document.getElementById('edit-city').value.trim();

    if (!nuevoUser) {
        showToast("El nombre de usuario no puede quedar vacío.", "error");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/update-profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: nuevoUser, city: nuevaCiudad, email: user.email })
        });

        if (res.ok) {
            showToast("¡Perfil de explorador actualizado!");
            user.username = nuevoUser;
            user.city = nuevaCiudad;
            localStorage.setItem('viajero_session', JSON.stringify(user));
            
            toggleEdit();
            checkSession();
        } else {
            showToast("Error al guardar los cambios en el servidor.", "error");
        }
    } catch (error) {
        showToast("Error de comunicación.", "error");
    }
}

/* --- GUÍA VIRTUAL DE IA --- */
function setQuickQuestion(text) { 
    const chatInput = document.getElementById('chat-input');
    if(chatInput) {
        chatInput.value = text; 
        sendUserMessage(); 
    }
}
function handleChatKey(e) { if (e.key === 'Enter') sendUserMessage(); }

function sendUserMessage() {
    const input = document.getElementById('chat-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const userMsg = document.createElement('div');
    userMsg.className = 'message user';
    userMsg.innerText = text; 
    chatMessages.appendChild(userMsg);

    input.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    setTimeout(() => {
        const normalizedText = text.toLowerCase();
        let aiText = aiResponses["default"];
        for (let key in aiResponses) { if (normalizedText.includes(key)) { aiText = aiResponses[key]; break; } }

        const aiMsg = document.createElement('div');
        aiMsg.className = 'message ai';
        aiMsg.innerHTML = `
            <div class="ai-badge"><i data-lucide="bot" style="width: 1rem; height: 1rem;"></i> Guía IA Pinolero</div>
            <div class="ai-body"></div>
        `;
        aiMsg.querySelector('.ai-body').innerHTML = aiText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'); 
        
        chatMessages.appendChild(aiMsg);
        if (window.lucide) lucide.createIcons();
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 600);
}

window.onload = function() {
    // Verificar si hay sesión iniciada inmediatamente al cargar el documento
    checkSession();

    try {
        if (window.lucide) lucide.createIcons();
    } catch (e) {
        console.error("Error en Lucide:", e);
    }

    const splash = document.getElementById('splash-screen');
    const contenido = document.getElementById('main-content');

    if (splash) {
        setTimeout(() => {
            if (typeof navigateTo === 'function') {
                navigateTo('/');
            }
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
                if (contenido) {
                    contenido.style.display = 'block';
                    contenido.style.opacity = '1';
                }
            }, 500);
        }, 0);
    }
    
    // Variable global para almacenar la instancia del mapa y evitar duplicados
let leafletMapInstance = null;

document.querySelectorAll('.dept-trigger').forEach(dept => {
  dept.addEventListener('click', function() {
    const name = this.getAttribute('name');
    const lat = parseFloat(this.getAttribute('data-lat'));
    const lng = parseFloat(this.getAttribute('data-lng'));
    const zoom = parseInt(this.getAttribute('data-zoom')) || 11;

    // 1. Mostrar la sección del mapa detallado
    const seccionDetalle = document.getElementById('mapa-detalle-seccion');
    seccionDetalle.style.display = 'block';
    
    // 2. Actualizar el título de la sección
    document.getElementById('nombre-departamento').textContent = name;

    // 3. Hacer scroll suave hacia la sección
    seccionDetalle.scrollIntoView({ behavior: 'smooth' });

    // 4. Inicializar o actualizar Leaflet
    if (leafletMapInstance) {
      // Si el mapa ya existe, solo movemos la vista suavemente al nuevo destino
      leafletMapInstance.setView([lat, lng], zoom);
    } else {
      // Si es la primera vez que hacen clic, creamos el mapa
      leafletMapInstance = L.map('leaflet-map').setView([lat, lng], zoom);

      // Añadimos la capa de mapa (OpenStreetMap estándar)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(leafletMapInstance);
    }

    // Opcional: Añadir un marcador en el centro del departamento escogido
    // Limpiamos marcadores anteriores si es necesario manejando un LayerGroup, 
    // o simplemente dejamos un pin en el centro:
    L.marker([lat, lng]).addTo(leafletMapInstance)
      .bindPopup(`<b>Bienvenido a ${name}</b>`)
      .openPopup();
  });
});

// Lógica para cerrar la sección si el usuario quiere regresar al mapa general
document.getElementById('btn-cerrar-detalle').addEventListener('click', () => {
  document.getElementById('mapa-detalle-seccion').style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
};